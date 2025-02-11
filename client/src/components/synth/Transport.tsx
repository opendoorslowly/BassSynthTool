import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Square, Save } from "lucide-react";
import { startPlayback, stopPlayback, setTempo } from "@/lib/audio";
import { useState } from "react";

export default function Transport() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempoState] = useState(120);

  const handlePlayStop = () => {
    if (isPlaying) {
      stopPlayback();
      setIsPlaying(false);
    } else {
      startPlayback();
      setIsPlaying(true);
    }
  };

  const handleTempoChange = (value: number[]) => {
    const newTempo = value[0];
    setTempoState(newTempo);
    setTempo(newTempo);
  };

  return (
    <div className="flex items-center gap-4">
      <Button onClick={handlePlayStop}>
        {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm">Tempo</span>
        <Slider
          value={[tempo]}
          onValueChange={handleTempoChange}
          max={300}
          min={60}
          step={1}
        />
        <span className="text-sm w-12">{tempo}</span>
      </div>

      <Button variant="outline">
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>
    </div>
  );
}
