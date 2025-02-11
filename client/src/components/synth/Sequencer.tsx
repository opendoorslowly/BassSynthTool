import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Step } from "@shared/schema";
import { updateSequence } from "@/lib/audio";

const NOTES = ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4"];

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
            className="w-full p-1 text-xs"
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
