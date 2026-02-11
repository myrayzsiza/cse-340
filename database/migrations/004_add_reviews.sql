-- Reviews table for inventory reviews
CREATE TABLE IF NOT EXISTS reviews (
  review_id SERIAL PRIMARY KEY,
  inventory_id INTEGER NOT NULL REFERENCES inventory(inv_id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(inventory_id, account_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_inventory_id ON reviews(inventory_id);
CREATE INDEX IF NOT EXISTS idx_reviews_account_id ON reviews(account_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);
