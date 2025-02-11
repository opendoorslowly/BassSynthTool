import { usePatterns, useDeletePattern } from "@/lib/patterns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import type { Pattern } from "@shared/schema";

interface PatternListProps {
  onLoad: (pattern: Pattern) => void;
}

export default function PatternList({ onLoad }: PatternListProps) {
  const { data: patterns, isLoading } = usePatterns();
  const deleteMutation = useDeletePattern();

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <h2 className="text-lg font-semibold">Saved Patterns</h2>
      <div className="grid gap-2 max-h-48 overflow-y-auto">
        {patterns?.map((pattern) => (
          <Card key={pattern.id} className="p-3 flex justify-between items-center">
            <div>
              <h3 className="font-medium">{pattern.name}</h3>
              <p className="text-sm text-muted-foreground">BPM: {pattern.tempo}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onLoad(pattern)}>
                Load
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteMutation.mutate(pattern.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
