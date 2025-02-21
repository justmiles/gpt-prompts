import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useUpvotes() {
  const [upvotes, setUpvotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadUpvotes();
  }, []);

  async function loadUpvotes() {
    try {
      const { data, error } = await supabase
        .from('upvotes')
        .select('prompt_slug, count');

      if (error) {
        throw error;
      }

      const upvotesMap = data.reduce((acc, { prompt_slug, count }) => {
        acc[prompt_slug] = count;
        return acc;
      }, {} as Record<string, number>);

      setUpvotes(upvotesMap);
      setError(null);
    } catch (error) {
      console.error('Error loading upvotes:', error);
      setError(error instanceof Error ? error : new Error('Failed to load upvotes'));
    } finally {
      setLoading(false);
    }
  }

  async function upvotePrompt(promptSlug: string) {
    try {
      // Check if an upvote record exists
      const { data, error: selectError } = await supabase
        .from('upvotes')
        .select('*')
        .eq('prompt_slug', promptSlug);

      if (selectError) throw selectError;

      if (data && data.length > 0) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('upvotes')
          .update({ count: data[0].count + 1 })
          .eq('prompt_slug', promptSlug);

        if (updateError) throw updateError;

        setUpvotes(prev => ({
          ...prev,
          [promptSlug]: (prev[promptSlug] || 0) + 1
        }));
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('upvotes')
          .insert({ prompt_slug: promptSlug, count: 1 });

        if (insertError) throw insertError;

        setUpvotes(prev => ({
          ...prev,
          [promptSlug]: 1
        }));
      }

      setError(null);
      // Refresh upvotes after modification
      loadUpvotes();
    } catch (error) {
      console.error('Error upvoting prompt:', error);
      setError(error instanceof Error ? error : new Error('Failed to upvote prompt'));
    }
  }

  return {
    upvotes,
    loading,
    error,
    upvotePrompt
  };
}