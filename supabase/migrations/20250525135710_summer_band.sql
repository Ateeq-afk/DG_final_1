/*
  # Add branch_id to vehicles table

  1. New Columns
    - Add `branch_id` column to vehicles table with foreign key reference to branches
  2. Security
    - No changes to RLS
  3. Changes
    - Add foreign key constraint to ensure branch_id references a valid branch
*/

-- Add branch_id column to vehicles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'branch_id'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN branch_id UUID REFERENCES branches(id);
  END IF;
END $$;

-- Create index on branch_id for better query performance
CREATE INDEX IF NOT EXISTS idx_vehicles_branch_id ON vehicles(branch_id);