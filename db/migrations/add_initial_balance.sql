-- Migration: Add initial_balance field to users table
-- This allows users to set their starting balance without creating a transaction

-- Add initial_balance column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS initial_balance NUMERIC(14,2) NOT NULL DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN users.initial_balance IS 'Starting balance for the user, added to transaction-based balance calculation';
