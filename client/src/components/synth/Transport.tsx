import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Square, Save, RefreshCw } from "lucide-react";
import { startPlayback, stopPlayback, setTempo } from "@/lib/audio";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { saveSequencerAsPattern } from "@/lib/patterns";
import { useToast } from "@/hooks/use-toast";

interface TransportProps {
  steps: any[];
  onClear?: () => void;
}

export default function Transport({ steps, onClear }: TransportProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempoState] = useState(120);
  const [patternName, setPatternName] = useState("");
  const { toast } = useToast();

  const handlePlayStop = () => {
    try {
      if (isPlaying) {
        stopPlayback();
        setIsPlaying(false);
      } else {
        startPlayback();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
      setIsPlaying(false);
    }
  };

  const handleClear = () => {
    try {
      if (isPlaying) {
        stopPlayback();
        setIsPlaying(false);
      }
      setTempoState(120); // Reset tempo to default
      if (onClear) {
        onClear();
      }
    } catch (error) {
      console.error("Error clearing:", error);
    }
  };

  const handleTempoChange = (value: number[]) => {
    try {
      const newTempo = value[0];
      setTempoState(newTempo);
      setTempo(newTempo);
    } catch (error) {
      console.error("Error changing tempo:", error);
    }
  };

  useEffect(() => {
    // Reset tempo slider when cleared
    if (!isPlaying) {
      setTempo(tempo);
    }
  }, [tempo, isPlaying]);

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

      <Button variant="outline" onClick={handleClear}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Clear
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