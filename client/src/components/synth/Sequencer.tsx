import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Step } from "@shared/schema";
import { updateSequence } from "@/lib/audio";

// Expanded note range covering 2 octaves
const NOTES = [
  "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
  "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
  "C4"
];

export default function Sequencer() {
  const [steps, setSteps] = useState<Step[]>(
    Array(16).fill(null).map(() => ({
      note: "C3",
      accent: false,
      slide: false,
      active: false,
    }))
  );

  const toggleStep = (index: number) => {
    const newSteps = [...steps];
    newSteps[index] = {
      ...newSteps[index],
      active: !newSteps[index].active,
    };
    setSteps(newSteps);
    updateSequence(newSteps);
  };

  const updateNote = (index: number, note: string) => {
    const newSteps = [...steps];
    newSteps[index] = {
      ...newSteps[index],
      note,
    };
    setSteps(newSteps);
    updateSequence(newSteps);
  };

  return (
    <div className="grid grid-cols-8 gap-2">
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col gap-1">
          <select
            className="w-full p-1 text-xs bg-white/90 rounded-sm"
            value={step.note}
            onChange={(e) => updateNote(i, e.target.value)}
          >
            {NOTES.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
          <Button
            variant={step.active ? "default" : "outline"}
            size="sm"
            onClick={() => toggleStep(i)}
          >
            {i + 1}
          </Button>
        </div>
      ))}
    </div>
  );
}