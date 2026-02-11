-- Roles table for role-based access control
CREATE TABLE IF NOT EXISTS roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add role_id to account table if it doesn't exist
ALTER TABLE account ADD COLUMN IF NOT EXISTS role_id INTEGER DEFAULT 1 REFERENCES roles(role_id);

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES 
  ('Client', 'Regular customer'),
  ('Employee', 'Employee account'),
  ('Admin', 'Administrator account')
ON CONFLICT DO NOTHING;

CREATE INDEX idx_account_role_id ON account(role_id);
