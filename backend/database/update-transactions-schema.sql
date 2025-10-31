-- Migration: Add sender_wallet field to transactions table
-- This allows tracking both sender and receiver history properly

-- Add sender_wallet column
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS sender_wallet VARCHAR(42);

-- Create index on sender_wallet for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_sender_wallet ON transactions(sender_wallet);

-- Create index on recipient_wallet for faster queries  
CREATE INDEX IF NOT EXISTS idx_transactions_recipient_wallet ON transactions(recipient_wallet);

-- Add comment to document the column
COMMENT ON COLUMN transactions.sender_wallet IS 'The wallet address that sent the transaction';
COMMENT ON COLUMN transactions.recipient_wallet IS 'The wallet address that received the transaction';


