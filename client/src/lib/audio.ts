import * as Tone from "tone";
import type { Step } from "@shared/schema";

let synth: Tone.MonoSynth;
let filter: Tone.Filter;
let sequence: Tone.Sequence<any>;
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

  try {
    await Tone.start();
    console.log("Tone.js initialized successfully");

    // Create analyzer for visualization
    analyzer = new Tone.Analyser({
      type: "waveform",
      size: 64,
      smoothing: 0.8
    });

    // TB-303 style effects chain
    delay = new Tone.FeedbackDelay({
      delayTime: 0.375,
      feedback: 0.4,
      wet: 0.3
    }).toDestination();

    reverb = new Tone.Reverb({
      decay: 2,
      wet: 0.2
    }).toDestination();

    pitchShift = new Tone.PitchShift({
      pitch: 0,
      windowSize: 0.02,
      delayTime: 0,
      feedback: 0,
      wet: 1
    }).toDestination();

    chorus = new Tone.Chorus({
      frequency: 1.5,
      delayTime: 2.5,
      depth: 0.5,
      wet: 0.2
    }).toDestination();

    // TB-303 style filter
    filter = new Tone.Filter({
      type: "lowpass",
      frequency: 350, // Start with low cutoff
      rolloff: -24,
      Q: 12 // High resonance characteristic of the 303
    }).toDestination();

    // TB-303 style monosynth
    synth = new Tone.MonoSynth({
      oscillator: {
        type: "sawtooth"
      },
      envelope: {
        attack: 0.003, // Super fast attack
        decay: 0.1,
        sustain: 0.3,
        release: 0.1
      },
      filterEnvelope: {
        attack: 0.002,
        decay: 0.1,
        sustain: 0.1,
        release: 0.1,
        baseFrequency: 350,
        octaves: 7, // Wide filter sweep
        exponent: 2
      }
    }).toDestination();

    // Connect the audio chain
    synth.chain(
      filter,
      pitchShift,
      chorus,
      delay,
      reverb,
      analyzer,
      Tone.Destination
    );

    // Set initial volume
    Tone.Destination.volume.value = -12;
    isInitialized = true;
    console.log("Audio chain initialized successfully");
  } catch (error) {
    console.error("Failed to initialize audio:", error);
    throw error;
  }
}

export function updateParameter(param: string, value: number) {
  if (!isInitialized) return;

  const safeValue = Math.max(0, Math.min(1, value));

  switch (param) {
    case "cutoff":
      // TB-303 style cutoff mapping (exponential)
      const cutoffFreq = Math.pow(2, safeValue * 12) * 100;
      filter.frequency.value = Math.min(12000, Math.max(20, cutoffFreq));
      break;
    case "resonance":
      // TB-303 style resonance (more aggressive)
      filter.Q.value = Math.pow(safeValue, 2) * 25;
      break;
    case "envMod":
      // TB-303 style envelope modulation (wider range)
      envModAmount = safeValue * 7;
      synth.filterEnvelope.octaves = envModAmount;
      break;
    case "decay":
      // TB-303 style decay (shorter range for snappier response)
      const decayTime = 0.02 + (safeValue * 0.3);
      synth.envelope.decay = decayTime;
      synth.filterEnvelope.decay = decayTime;
      break;
    case "accent":
      // TB-303 style accent (more dramatic)
      synth.volume.value = Math.max(-20, safeValue * 25 - 15);
      break;
    case "volume":
      Tone.Destination.volume.value = Math.max(-60, (safeValue * 60) - 60);
      break;
    // Effect parameters remain the same
    case "delayTime":
      delay.delayTime.value = safeValue * 0.75;
      break;
    case "delayFeedback":
      delay.feedback.value = safeValue * 0.85;
      break;
    case "reverbDecay":
      reverb.decay = safeValue * 5;
      break;
    case "pitch":
      const pitchValue = (safeValue * 24) - 12;
      pitchShift.pitch = pitchValue;
      break;
    case "chorusDepth":
      chorus.depth = safeValue;
      break;
    case "chorusFreq":
      chorus.frequency.value = safeValue * 4;
      break;
  }
}

export function updateSequence(steps: Step[]) {
  if (!isInitialized) return;

  try {
    if (sequence) {
      sequence.stop();
      sequence.dispose();
    }

    sequence = new Tone.Sequence(
      (time, step: Step) => {
        if (!step?.active) return;

        // TB-303 style velocity and accent handling
        const velocity = step.accent ? 1 : 0.7;

        if (step.accent) {
          // Increase filter envelope amount for accented notes
          synth.filterEnvelope.octaves = Math.max(0, envModAmount * 2);
          synth.envelope.decay = 0.2; // Longer decay for accented notes
        } else {
          synth.filterEnvelope.octaves = Math.max(0, envModAmount);
          synth.envelope.decay = 0.1; // Normal decay
        }

        // TB-303 style slide timing
        const noteLength = step.slide ? "8n" : "16n";
        synth.triggerAttackRelease(step.note, noteLength, time, velocity);
      },
      steps,
      "16n"
    );

    if (Tone.Transport.state === "started") {
      sequence.start(0);
    }
  } catch (error) {
    console.error("Error updating sequence:", error);
  }
}

export function startPlayback() {
  if (!isInitialized) return;
  Tone.Transport.start();
  sequence?.start(0);
}

export function stopPlayback() {
  if (!isInitialized) return;
  try {
    Tone.Transport.stop();
    if (sequence) {
      sequence.stop();
      sequence.dispose();
      sequence = null;
    }
  } catch (error) {
    console.error("Error stopping playback:", error);
  }
}

export function setTempo(bpm: number) {
  if (!isInitialized) return;
  try {
    const safeBpm = Math.max(20, Math.min(300, bpm));
    Tone.Transport.bpm.value = safeBpm;
  } catch (error) {
    console.error("Error setting tempo:", error);
  }
}