import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Bookmark {
  id: string;
  paper_id: string;
  created_at: string;
}

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('id, paper_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarks:', error);
    } else {
      setBookmarks(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const isBookmarked = useCallback((paperId: string) => {
    return bookmarks.some(b => b.paper_id === paperId);
  }, [bookmarks]);

  const toggleBookmark = useCallback(async (paperId: string) => {
    if (!user) {
      toast.error('Please sign in to bookmark papers');
      return;
    }

    const existing = bookmarks.find(b => b.paper_id === paperId);

    if (existing) {
      // Remove bookmark
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('id', existing.id);

      if (error) {
        toast.error('Failed to remove bookmark');
        return;
      }

      setBookmarks(prev => prev.filter(b => b.id !== existing.id));
      toast.success('Removed from bookmarks');
    } else {
      // Add bookmark
      const { data, error } = await supabase
        .from('user_bookmarks')
        .insert({ user_id: user.id, paper_id: paperId })
        .select()
        .single();

      if (error) {
        toast.error('Failed to add bookmark');
        return;
      }

      setBookmarks(prev => [data, ...prev]);
      toast.success('Added to bookmarks');
    }
  }, [user, bookmarks]);

  return {
    bookmarks,
    loading,
    isBookmarked,
    toggleBookmark,
    fetchBookmarks,
  };
}
