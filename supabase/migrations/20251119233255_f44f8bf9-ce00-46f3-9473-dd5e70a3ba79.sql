-- Add exercises column to workout_history table to store full exercise details
ALTER TABLE workout_history
ADD COLUMN exercises JSONB DEFAULT '[]'::jsonb;