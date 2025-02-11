import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Knob from "@/components/synth/Knob";
import Sequencer from "@/components/synth/Sequencer";
import Transport from "@/components/synth/Transport";
import ReactiveBackground from "@/components/synth/ReactiveBackground";
import { initAudio, updateParameter } from "@/lib/audio";

export default function Tb303() {
  const [initialized, setInitialized] = useState(false);

  const handleInitialize = async () => {
    try {
      await initAudio();
      setInitialized(true);
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">TB-303 Bass Synthesizer</h2>
          <p className="mb-4 text-gray-600">Click the button below to start the audio engine</p>
          <Button onClick={handleInitialize} size="lg">
            Initialize Audio
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <ReactiveBackground>
      <div className="min-h-screen p-4">
        <Card className="max-w-4xl mx-auto bg-gray-200/90 backdrop-blur p-6 rounded-lg">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">TB-303</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Knob 
                label="Cutoff"
                onChange={(v) => updateParameter("cutoff", v)}
                defaultValue={0.4}
              />
              <Knob
                label="Resonance"
                onChange={(v) => updateParameter("resonance", v)}
                defaultValue={0.7}
              />
              <Knob
                label="Env Mod"
                onChange={(v) => updateParameter("envMod", v)}
                defaultValue={0.6}
              />
              <Knob
                label="Decay"
                onChange={(v) => updateParameter("decay", v)}
                defaultValue={0.3}
              />
              <Knob
                label="Accent"
                onChange={(v) => updateParameter("accent", v)}
                defaultValue={0.5}
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
    </ReactiveBackground>
  );
}