/*
  # Add upvotes tracking

  1. New Tables
    - `upvotes`
      - `id` (uuid, primary key)
      - `prompt_id` (text, not null) - References the prompt ID
      - `created_at` (timestamp with timezone)
      - `count` (integer) - Number of upvotes for the prompt

  2. Security
    - Enable RLS on `upvotes` table
    - Add policies for:
      - Anyone can read upvotes
      - Anyone can update upvotes (we'll control this via application logic)
*/

CREATE TABLE IF NOT EXISTS upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  count integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read upvotes
CREATE POLICY "Anyone can read upvotes" ON upvotes
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to update upvotes (controlled via application logic)
CREATE POLICY "Anyone can update upvotes" ON upvotes
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow anyone to insert upvotes
CREATE POLICY "Anyone can insert upvotes" ON upvotes
  FOR INSERT
  TO public
  WITH CHECK (true);