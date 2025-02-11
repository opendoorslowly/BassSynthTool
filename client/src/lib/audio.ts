import * as Tone from "tone";
import type { Step } from "@shared/schema";

let synth: Tone.MonoSynth;
let filter: Tone.Filter;
let sequence: Tone.Sequence;
let analyzer: Tone.Analyser;
let delay: Tone.FeedbackDelay;
let reverb: Tone.Reverb;
let pitchShift: Tone.PitchShift;
let isInitialized = false;
let envModAmount = 0;

export function getAudioIntensity(): number {
  if (!analyzer) return 0;
  const values = analyzer.getValue();
  const sum = (values as Float32Array).reduce((acc, val) => acc + Math.abs(val), 0);
  return sum / values.length;
}

export async function initAudio() {
  if (isInitialized) return;

  await Tone.start();

  // Create effects
  delay = new Tone.FeedbackDelay({
    delayTime: "8n",
    feedback: 0.3,
    wet: 0.2
  }).toDestination();

  reverb = new Tone.Reverb({
    decay: 2,
    wet: 0.2
  }).toDestination();

  pitchShift = new Tone.PitchShift({
    pitch: 0,
    wet: 0.5
  }).toDestination();

  analyzer = new Tone.Analyser({
    type: "waveform",
    size: 64,
    smoothing: 0.8
  });

  filter = new Tone.Filter({
    type: "lowpass",
    frequency: 2000,
    rolloff: -24
  });

  synth = new Tone.MonoSynth({
    oscillator: {
      type: "sawtooth"
    },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.1
    },
    filterEnvelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.1,
      baseFrequency: 2000,
      octaves: 4,
      exponent: 2
    }
  });

  // Connect the audio chain: synth -> filter -> pitchShift -> delay -> reverb -> analyzer -> output
  synth.chain(filter, pitchShift, delay, reverb, analyzer);
  analyzer.toDestination();

  Tone.Destination.volume.value = -12;
  isInitialized = true;
}

export function updateParameter(param: string, value: number) {
  if (!isInitialized) return;

  switch (param) {
    case "cutoff":
      const cutoffFreq = Math.pow(2, value * 10) * 20;
      filter.frequency.value = Math.min(20000, Math.max(20, cutoffFreq));
      break;
    case "resonance":
      filter.Q.value = Math.pow(value, 2) * 30;
      break;
    case "envMod":
      envModAmount = value * 4;
      synth.filterEnvelope.octaves = envModAmount;
      break;
    case "decay":
      const decayTime = 0.05 + (value * 0.95);
      synth.envelope.decay = decayTime;
      synth.filterEnvelope.decay = decayTime;
      break;
    case "accent":
      synth.volume.value = Math.max(-20, value * 20 - 10);
      break;
    case "volume":
      Tone.Destination.volume.value = Math.max(-60, (value * 60) - 60);
      break;
    // Effect parameters
    case "delayTime":
      delay.delayTime.value = value * 0.5; // 0 to 500ms
      break;
    case "delayFeedback":
      delay.feedback.value = value * 0.9; // 0 to 0.9 to avoid infinite feedback
      break;
    case "reverbDecay":
      reverb.decay = value * 5; // 0 to 5 seconds
      break;
    case "pitch":
      pitchShift.pitch = Math.round((value * 24) - 12); // -12 to +12 semitones
      break;
  }
}

export function updateSequence(steps: Step[]) {
  if (!isInitialized) return;

  if (sequence) {
    sequence.stop();
    sequence.dispose();
  }

  sequence = new Tone.Sequence(
    (time, step: Step) => {
      if (step?.active) {
        const velocity = step.accent ? 1 : 0.7;

        if (step.accent) {
          synth.filterEnvelope.octaves = envModAmount * 1.5;
        } else {
          synth.filterEnvelope.octaves = envModAmount;
        }

        const noteLength = step.slide ? "8n" : "16n";
        synth.triggerAttackRelease(step.note, noteLength, time, velocity);
      }
    },
    steps,
    "16n"
  );

  if (Tone.Transport.state === "started") {
    sequence.start(0);
  }
}

export function startPlayback() {
  if (!isInitialized) return;
  Tone.Transport.start();
  sequence?.start(0);
}

export function stopPlayback() {
  if (!isInitialized) return;
  Tone.Transport.stop();
  sequence?.stop();
}

export function setTempo(bpm: number) {
  if (!isInitialized) return;
  Tone.Transport.bpm.value = Math.max(20, Math.min(300, bpm));
}