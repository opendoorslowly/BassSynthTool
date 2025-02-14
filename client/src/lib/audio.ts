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
    });

    reverb = new Tone.Reverb({
      decay: 2,
      wet: 0.2,
      preDelay: 0.01 // Minimum preDelay to avoid glitches
    });

    // Initialize pitchShift with better settings for TB-303 style sounds
    pitchShift = new Tone.PitchShift({
      pitch: 0,
      windowSize: 0.02,
      delayTime: 0.001,     // Minimum safe delay time
      feedback: 0,
      wet: 1
    });

    chorus = new Tone.Chorus({
      frequency: 1.5,
      delayTime: 2.5,
      depth: 0.5,
      wet: 0.5  // Increased wet mix for more noticeable effect
    }).start();  // Explicitly start the chorus

    // TB-303 style filter with higher initial resonance
    filter = new Tone.Filter({
      type: "lowpass",
      frequency: 350,
      rolloff: -24,
      Q: 15 // Increased base resonance
    });

    // TB-303 style monosynth
    synth = new Tone.MonoSynth({
      oscillator: {
        type: "sawtooth"
      },
      envelope: {
        attack: 0.003,
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
        octaves: 7,
        exponent: 2
      }
    });

    // Connect the audio chain with optimized routing for effects
    synth.connect(filter);
    filter.connect(chorus);  // Move chorus before pitch shift for better modulation
    chorus.connect(pitchShift);
    pitchShift.connect(delay);
    delay.connect(reverb);
    reverb.connect(analyzer);
    analyzer.toDestination();

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
      const cutoffFreq = Math.pow(2, safeValue * 14) * 60; // Adjusted range
      filter.frequency.value = Math.min(12000, Math.max(20, cutoffFreq));
      break;
    case "resonance":
      // TB-303 style resonance (more aggressive)
      // Map 0-1 to exponential curve for more dramatic resonance
      const resonanceValue = Math.pow(safeValue, 1.5) * 35; // Increased maximum resonance
      filter.Q.value = resonanceValue;
      break;
    case "envMod":
      // TB-303 style envelope modulation
      envModAmount = safeValue * 7;
      synth.filterEnvelope.octaves = envModAmount;
      break;
    case "decay":
      // TB-303 style decay
      const decayTime = Math.max(0.001, 0.02 + (safeValue * 0.3));
      synth.envelope.decay = decayTime;
      synth.filterEnvelope.decay = decayTime;
      break;
    case "accent":
      // TB-303 style accent
      synth.volume.value = Math.max(-20, safeValue * 25 - 15);
      break;
    case "volume":
      Tone.Destination.volume.value = Math.max(-60, (safeValue * 60) - 60);
      break;
    case "delayTime":
      delay.delayTime.value = Math.max(0.001, safeValue * 0.75);
      break;
    case "delayFeedback":
      delay.feedback.value = safeValue * 0.85;
      break;
    case "reverbDecay":
      // Ensure minimum reverb decay time
      const reverbDecayTime = Math.max(0.1, safeValue * 5);
      reverb.decay = reverbDecayTime;
      break;
    case "pitch":
      const pitchValue = (safeValue * 24) - 12;
      pitchShift.pitch = pitchValue;
      break;
    case "chorusDepth":
      // Ensure minimum chorus depth and apply immediately
      const chorusDepthValue = Math.max(0.01, safeValue);
      chorus.depth.value = chorusDepthValue;  // Use .value for immediate update
      break;
    case "chorusFreq":
      // Ensure minimum chorus frequency and apply immediately
      const chorusFreq = Math.max(0.01, safeValue * 4);
      chorus.frequency.value = chorusFreq;
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
          // Increase filter envelope amount and resonance for accented notes
          synth.filterEnvelope.octaves = Math.max(0, envModAmount * 2);
          filter.Q.value = filter.Q.value * 1.5; // Boost resonance on accents
          synth.envelope.decay = 0.2;
        } else {
          synth.filterEnvelope.octaves = Math.max(0, envModAmount);
          filter.Q.rampTo(filter.Q.value / 1.5, 0.1); // Return to normal resonance
          synth.envelope.decay = 0.1;
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
    throw error;
  }
}

export function startPlayback() {
  if (!isInitialized) return;
  try {
    Tone.Transport.start();
    sequence?.start(0);
  } catch (error) {
    console.error("Error starting playback:", error);
    throw error;
  }
}

export function stopPlayback() {
  if (!isInitialized) return;
  try {
    Tone.Transport.stop();
    sequence?.stop();
  } catch (error) {
    console.error("Error stopping playback:", error);
    throw error;
  }
}

export function setTempo(bpm: number) {
  if (!isInitialized) return;
  try {
    const safeBpm = Math.max(20, Math.min(300, bpm));
    Tone.Transport.bpm.value = safeBpm;
  } catch (error) {
    console.error("Error setting tempo:", error);
    throw error;
  }
}