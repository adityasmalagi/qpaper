import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export type ProgressStatus = 'want_to_attempt' | 'in_progress' | 'completed';

export interface PaperProgress {
  id: string;
  user_id: string;
  paper_id: string;
  status: ProgressStatus;
  score: number | null;
  time_spent: number;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudyStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export interface ProgressStats {
  total: number;
  want_to_attempt: number;
  in_progress: number;
  completed: number;
  streak: StudyStreak | null;
}

export function useProgress(paperId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [progress, setProgress] = useState<PaperProgress | null>(null);
  const [stats, setStats] = useState<ProgressStats>({
    total: 0,
    want_to_attempt: 0,
    in_progress: 0,
    completed: 0,
    streak: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch specific paper progress if paperId provided
      if (paperId) {
        const { data, error } = await supabase
          .from('user_paper_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('paper_id', paperId)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setProgress({
            ...data,
            status: data.status as ProgressStatus,
          });
        } else {
          setProgress(null);
        }
      }

      // Fetch overall stats
      const { data: allProgress, error: statsError } = await supabase
        .from('user_paper_progress')
        .select('status')
        .eq('user_id', user.id);

      if (statsError) throw statsError;

      const counts = {
        total: allProgress?.length || 0,
        want_to_attempt: 0,
        in_progress: 0,
        completed: 0,
      };

      allProgress?.forEach(p => {
        if (p.status in counts) {
          counts[p.status as keyof typeof counts]++;
        }
      });

      // Fetch streak
      const { data: streakData } = await supabase
        .from('study_streaks')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', user.id)
        .maybeSingle();

      setStats({
        ...counts,
        streak: streakData,
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user, paperId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const updateProgress = async (
    targetPaperId: string,
    status: ProgressStatus,
    options?: { score?: number; notes?: string; time_spent?: number }
  ) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to track progress',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const updateData: any = {
        user_id: user.id,
        paper_id: targetPaperId,
        status,
        updated_at: new Date().toISOString(),
      };

      if (options?.score !== undefined) updateData.score = options.score;
      if (options?.notes !== undefined) updateData.notes = options.notes;
      if (options?.time_spent !== undefined) updateData.time_spent = options.time_spent;
      if (status === 'completed') updateData.completed_at = new Date().toISOString();

      const { error } = await supabase
        .from('user_paper_progress')
        .upsert(updateData, { onConflict: 'user_id,paper_id' });

      if (error) throw error;

      await fetchProgress();
      
      const statusLabels: Record<ProgressStatus, string> = {
        want_to_attempt: 'Want to Attempt',
        in_progress: 'In Progress',
        completed: 'Completed',
      };
      
      toast({ title: `Marked as "${statusLabels[status]}"` });
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive',
      });
      return false;
    }
  };

  const removeProgress = async (targetPaperId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_paper_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('paper_id', targetPaperId);

      if (error) throw error;

      await fetchProgress();
      toast({ title: 'Progress removed' });
      return true;
    } catch (error) {
      console.error('Error removing progress:', error);
      return false;
    }
  };

  return {
    progress,
    stats,
    loading,
    updateProgress,
    removeProgress,
    refetch: fetchProgress,
  };
}
