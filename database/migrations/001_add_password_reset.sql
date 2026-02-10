-- Add password reset fields to account table
ALTER TABLE public.account 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- Create index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_account_reset_token ON public.account(reset_token);
