import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Knob from "@/components/synth/Knob";
import Sequencer from "@/components/synth/Sequencer";
import Transport from "@/components/synth/Transport";
import { initAudio, updateParameter } from "@/lib/audio";

export default function Tb303() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initAudio().then(() => setInitialized(true));
  }, []);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        Click to start audio engine
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-4xl mx-auto bg-gray-200 p-6 rounded-lg">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">TB-303</h1>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Knob 
              label="Cutoff"
              onChange={(v) => updateParameter("cutoff", v)}
              defaultValue={0.5}
            />
            <Knob
              label="Resonance"
              onChange={(v) => updateParameter("resonance", v)}
              defaultValue={0.3}
            />
            <Knob
              label="Env Mod"
              onChange={(v) => updateParameter("envMod", v)}
              defaultValue={0.5}
            />
            <Knob
              label="Decay"
              onChange={(v) => updateParameter("decay", v)}
              defaultValue={0.6}
            />
            <Knob
              label="Accent"
              onChange={(v) => updateParameter("accent", v)}
              defaultValue={0.7}
            />
            <Knob
              label="Volume"
              onChange={(v) => updateParameter("volume", v)}
              defaultValue={0.8}
            />
          </div>

          <Transport />
          <Sequencer />
        </div>
      </Card>
    </div>
  );
}
