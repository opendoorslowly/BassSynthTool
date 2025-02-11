import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Square, Save } from "lucide-react";
import { startPlayback, stopPlayback, setTempo } from "@/lib/audio";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { saveSequencerAsPattern } from "@/lib/patterns";
import { useToast } from "@/hooks/use-toast";

interface TransportProps {
  steps: any[];
}

export default function Transport({ steps }: TransportProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempoState] = useState(120);
  const [patternName, setPatternName] = useState("");
  const { toast } = useToast();

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

  const handleSave = async () => {
    if (!patternName) {
      toast({
        title: "Error",
        description: "Please enter a name for the pattern",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveSequencerAsPattern(patternName, steps, tempo);
      setPatternName("");
      toast({
        title: "Success",
        description: "Pattern saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save pattern",
        variant: "destructive",
      });
    }
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

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Pattern</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Enter pattern name"
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
            />
            <Button onClick={handleSave}>Save Pattern</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}