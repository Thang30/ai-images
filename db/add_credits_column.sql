-- Add credits column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 10 NOT NULL;

-- Update existing users to have 10 credits if they don't have any
UPDATE users 
SET credits = 10 
WHERE credits IS NULL;
