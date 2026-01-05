import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  color: string;
  papers_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionWithPapers extends Collection {
  papers: {
    id: string;
    paper_id: string;
    added_at: string;
  }[];
}

export function useCollections() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollections = useCallback(async () => {
    if (!user) {
      setCollections([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('paper_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const createCollection = async (name: string, description?: string, color?: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to create collections',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('paper_collections')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description?.trim() || null,
          color: color || '#6366f1',
        })
        .select()
        .single();

      if (error) throw error;

      await fetchCollections();
      toast({ title: 'Collection created!' });
      return data;
    } catch (error) {
      console.error('Error creating collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to create collection',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateCollection = async (
    collectionId: string,
    updates: { name?: string; description?: string; color?: string; is_public?: boolean }
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('paper_collections')
        .update(updates)
        .eq('id', collectionId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchCollections();
      toast({ title: 'Collection updated!' });
      return true;
    } catch (error) {
      console.error('Error updating collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to update collection',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteCollection = async (collectionId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('paper_collections')
        .delete()
        .eq('id', collectionId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchCollections();
      toast({ title: 'Collection deleted' });
      return true;
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete collection',
        variant: 'destructive',
      });
      return false;
    }
  };

  const addPaperToCollection = async (collectionId: string, paperId: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to add papers to collections',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase.from('collection_papers').insert({
        collection_id: collectionId,
        paper_id: paperId,
      });

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Paper already in collection' });
          return false;
        }
        throw error;
      }

      await fetchCollections();
      toast({ title: 'Paper added to collection!' });
      return true;
    } catch (error) {
      console.error('Error adding paper to collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to add paper to collection',
        variant: 'destructive',
      });
      return false;
    }
  };

  const removePaperFromCollection = async (collectionId: string, paperId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('collection_papers')
        .delete()
        .eq('collection_id', collectionId)
        .eq('paper_id', paperId);

      if (error) throw error;

      await fetchCollections();
      toast({ title: 'Paper removed from collection' });
      return true;
    } catch (error) {
      console.error('Error removing paper from collection:', error);
      return false;
    }
  };

  const getPaperCollections = async (paperId: string): Promise<string[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('collection_papers')
        .select('collection_id')
        .eq('paper_id', paperId);

      if (error) throw error;
      return data?.map(cp => cp.collection_id) || [];
    } catch (error) {
      console.error('Error getting paper collections:', error);
      return [];
    }
  };

  return {
    collections,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    addPaperToCollection,
    removePaperFromCollection,
    getPaperCollections,
    refetch: fetchCollections,
  };
}
