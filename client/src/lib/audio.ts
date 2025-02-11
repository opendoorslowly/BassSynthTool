import * as Tone from "tone";
import type { Step } from "@shared/schema";

let synth: Tone.MonoSynth;
let filter: Tone.Filter;
let sequence: Tone.Sequence;
let isInitialized = false;

export async function initAudio() {
  if (isInitialized) return;

  await Tone.start();

  synth = new Tone.MonoSynth({
    oscillator: {
      type: "sawtooth"
    },
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0.3,
      release: 0.1
    }
  }).toDestination();

  filter = new Tone.Filter({
    type: "lowpass",
    frequency: 1000,
    rolloff: -24
  }).toDestination();

  synth.connect(filter);
  isInitialized = true;
}

export function updateParameter(param: string, value: number) {
  if (!isInitialized) return;

  switch (param) {
    case "cutoff":
      filter.frequency.value = Math.max(0, value * 10000 + 100);
      break;
    case "resonance":
      filter.Q.value = Math.max(0, value * 20);
      break;
    case "decay":
      synth.envelope.decay = Math.max(0, value);
      break;
    case "accent":
      synth.volume.value = Math.max(-40, value * 10);
      break;
    case "volume":
      Tone.Destination.volume.value = Math.max(-40, (value * 2) - 1);
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
        synth.triggerAttackRelease(step.note, step.slide ? "8n" : "16n", time, velocity);
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