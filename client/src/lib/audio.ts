import * as Tone from "tone";
import type { Step } from "@shared/schema";

let synth: Tone.MonoSynth;
let filter: Tone.Filter;
let sequence: Tone.Sequence;
let analyzer: Tone.Analyser;
let isInitialized = false;
let envModAmount = 0;

// Add a function to get current audio intensity
export function getAudioIntensity(): number {
  if (!analyzer) return 0;
  const values = analyzer.getValue();
  // Get average value from the frequency data
  const sum = (values as Float32Array).reduce((acc, val) => acc + Math.abs(val), 0);
  return sum / values.length;
}

export async function initAudio() {
  if (isInitialized) return;

  await Tone.start();

  // Create analyzer for intensity detection
  analyzer = new Tone.Analyser({
    type: "waveform",
    size: 64,
    smoothing: 0.8
  });

  // Create filter first
  filter = new Tone.Filter({
    type: "lowpass",
    frequency: 2000,
    rolloff: -24
  });

  // Create synth with proper TB-303 settings
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

  // Connect synth through filter and analyzer to output
  synth.connect(filter);
  filter.connect(analyzer);
  analyzer.toDestination();

  // Set initial volume
  Tone.Destination.volume.value = -12;

  isInitialized = true;
}

export function updateParameter(param: string, value: number) {
  if (!isInitialized) return;

  switch (param) {
    case "cutoff":
      // Scale cutoff frequency exponentially (20Hz - 20kHz)
      const cutoffFreq = Math.pow(2, value * 10) * 20;
      filter.frequency.value = Math.min(20000, Math.max(20, cutoffFreq));
      break;
    case "resonance":
      // Scale resonance (Q) from 0.1 to 30
      filter.Q.value = Math.pow(value, 2) * 30;
      break;
    case "envMod":
      // Store env mod amount for use in sequence playback
      envModAmount = value * 4;
      synth.filterEnvelope.octaves = envModAmount;
      break;
    case "decay":
      // Scale decay from 50ms to 1s
      const decayTime = 0.05 + (value * 0.95);
      synth.envelope.decay = decayTime;
      synth.filterEnvelope.decay = decayTime;
      break;
    case "accent":
      // Scale accent velocity multiplier
      synth.volume.value = Math.max(-20, value * 20 - 10);
      break;
    case "volume":
      // Scale master volume from -60dB to 0dB
      Tone.Destination.volume.value = Math.max(-60, (value * 60) - 60);
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
        // Calculate note velocity based on accent
        const velocity = step.accent ? 1 : 0.7;

        // Update filter envelope based on accent
        if (step.accent) {
          synth.filterEnvelope.octaves = envModAmount * 1.5;
        } else {
          synth.filterEnvelope.octaves = envModAmount;
        }

        // Set note length based on slide
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