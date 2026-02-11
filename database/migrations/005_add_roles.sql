-- Roles table for role-based access control
CREATE TABLE IF NOT EXISTS roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles first (before adding foreign key constraint)
INSERT INTO roles (role_name, description) VALUES 
  ('Client', 'Regular customer'),
  ('Employee', 'Employee account'),
  ('Admin', 'Administrator account')
ON CONFLICT DO NOTHING;

-- Add role_id to account table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account' AND column_name='role_id') THEN
    ALTER TABLE account ADD COLUMN role_id INTEGER DEFAULT 1 REFERENCES roles(role_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_account_role_id ON account(role_id);
