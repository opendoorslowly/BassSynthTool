import * as Tone from "tone";
import type { Step } from "@shared/schema";

let synth: Tone.MonoSynth;
let filter: Tone.Filter;
let sequence: Tone.Sequence;
let analyzer: Tone.Analyser;
let delay: Tone.FeedbackDelay;
let reverb: Tone.Reverb;
let pitchShift: Tone.PitchShift;
let chorus: Tone.Chorus;
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

  // Create analyzer for visualization
  analyzer = new Tone.Analyser({
    type: "waveform",
    size: 64,
    smoothing: 0.8
  });

  // Create effects chain with Royksopp-style processing
  delay = new Tone.FeedbackDelay({
    delayTime: 0.375, // Triplet feel
    feedback: 0.4,
    wet: 0.3
  });

  reverb = new Tone.Reverb({
    decay: 3,
    wet: 0.25,
    preDelay: 0.2
  });

  pitchShift = new Tone.PitchShift({
    pitch: 0,
    windowSize: 0.1,
    wet: 0.5
  });

  chorus = new Tone.Chorus({
    frequency: 0.5,
    delayTime: 3.5,
    depth: 0.7,
    wet: 0.3
  }).start();

  // Create filter with more resonance for that classic analog sound
  filter = new Tone.Filter({
    type: "lowpass",
    frequency: 2000,
    rolloff: -24,
    Q: 4
  });

  // Create synth with Royksopp-inspired settings
  synth = new Tone.MonoSynth({
    oscillator: {
      type: "square8" // Rich harmonics for that warm analog sound
    },
    envelope: {
      attack: 0.005,
      decay: 0.2,
      sustain: 0.2,
      release: 0.4
    },
    filterEnvelope: {
      attack: 0.005,
      decay: 0.4,
      sustain: 0.2,
      release: 0.4,
      baseFrequency: 1000,
      octaves: 4,
      exponent: 2
    }
  });

  // Connect the audio chain with new effects
  synth.chain(filter, chorus, pitchShift, delay, reverb, analyzer, Tone.Destination);

  // Set initial volume
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
      delay.delayTime.value = value * 0.75; // 0 to 750ms
      break;
    case "delayFeedback":
      delay.feedback.value = value * 0.85; // 0 to 0.85 to avoid infinite feedback
      break;
    case "reverbDecay":
      reverb.decay = value * 5; // 0 to 5 seconds
      break;
    case "pitch":
      pitchShift.pitch = Math.round((value * 24) - 12); // -12 to +12 semitones
      break;
    case "chorusDepth":
      chorus.depth = value;
      break;
    case "chorusFreq":
      chorus.frequency.value = value * 4; // 0 to 4 Hz
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