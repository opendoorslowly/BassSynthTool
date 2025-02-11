import { useMutation, useQuery } from "@tanstack/react-query";
import { Pattern, type InsertPattern } from "@shared/schema";
import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";
import { useToast } from "@/hooks/use-toast";

// Pattern loading hook
export function usePatterns() {
  return useQuery<Pattern[]>({
    queryKey: ['/api/patterns'],
  });
}

// Single pattern loading hook
export function usePattern(id: number) {
  return useQuery<Pattern>({
    queryKey: ['/api/patterns', id],
    enabled: !!id,
  });
}

// Pattern creation hook
export function useCreatePattern() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (pattern: InsertPattern) => {
      const res = await apiRequest('POST', '/api/patterns', pattern);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patterns'] });
      toast({
        title: "Pattern saved",
        description: "Your pattern has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving pattern",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Pattern update hook
export function useUpdatePattern() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, pattern }: { id: number; pattern: Partial<InsertPattern> }) => {
      const res = await apiRequest('PATCH', `/api/patterns/${id}`, pattern);
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/patterns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patterns', id] });
      toast({
        title: "Pattern updated",
        description: "Your pattern has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating pattern",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Pattern deletion hook
export function useDeletePattern() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/patterns/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/patterns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patterns', id] });
      toast({
        title: "Pattern deleted",
        description: "The pattern has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting pattern",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Helper function to load a pattern into the sequencer
export async function loadPatternToSequencer(id: number) {
  try {
    const res = await fetch(`/api/patterns/${id}`, {
      credentials: 'include',
    });
    
    if (!res.ok) {
      throw new Error('Failed to load pattern');
    }

    const pattern = await res.json();
    return pattern;
  } catch (error) {
    console.error('Error loading pattern:', error);
    throw error;
  }
}

// Helper function to save current sequencer state as a pattern
export async function saveSequencerAsPattern(name: string, steps: any[], tempo: number) {
  try {
    const pattern: InsertPattern = {
      name,
      steps,
      tempo,
    };

    const res = await apiRequest('POST', '/api/patterns', pattern);
    return await res.json();
  } catch (error) {
    console.error('Error saving pattern:', error);
    throw error;
  }
}
