/*
  # Update upvotes table schema
  
  1. Changes
    - Replace prompt_id with prompt_slug as the reference to prompts
    - Add unique constraint on prompt_slug to prevent duplicates
    
  2. Security
    - Maintain existing RLS policies
*/

-- First create the new column
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'upvotes' AND column_name = 'prompt_slug'
  ) THEN
    ALTER TABLE upvotes ADD COLUMN prompt_slug text;
  END IF;
END $$;

-- Add NOT NULL constraint to prompt_slug
ALTER TABLE upvotes ALTER COLUMN prompt_slug SET NOT NULL;

-- Add unique constraint to prevent duplicate entries for the same prompt
ALTER TABLE upvotes ADD CONSTRAINT upvotes_prompt_slug_key UNIQUE (prompt_slug);

-- Drop the old prompt_id column if it exists
DO $$ 
BEGIN 
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'upvotes' AND column_name = 'prompt_id'
  ) THEN
    ALTER TABLE upvotes DROP COLUMN prompt_id;
  END IF;
END $$;