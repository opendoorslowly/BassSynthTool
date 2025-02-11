import * as Tone from "tone";
import type { Step } from "@shared/schema";

let synth: Tone.MonoSynth;
let filter: Tone.Filter;
let sequence: Tone.Sequence;

export async function initAudio() {
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
}

export function updateParameter(param: string, value: number) {
  switch (param) {
    case "cutoff":
      filter.frequency.value = value * 10000 + 100;
      break;
    case "resonance":
      filter.Q.value = value * 20;
      break;
    case "decay":
      synth.envelope.decay = value;
      break;
    case "accent":
      synth.volume.value = value * 10;
      break;
    case "volume":
      Tone.Destination.volume.value = (value * 2) - 1;
      break;
  }
}

export function updateSequence(steps: Step[]) {
  if (sequence) {
    sequence.dispose();
  }

  sequence = new Tone.Sequence(
    (time, step: Step) => {
      if (step.active) {
        synth.triggerAttackRelease(step.note, "16n", time);
      }
    },
    steps,
    "16n"
  );
}

export function startPlayback() {
  Tone.Transport.start();
  sequence?.start();
}

export function stopPlayback() {
  Tone.Transport.stop();
  sequence?.stop();
}

export function setTempo(bpm: number) {
  Tone.Transport.bpm.value = bpm;
}
