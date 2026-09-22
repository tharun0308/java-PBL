-- Add cosmetic display title column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_title VARCHAR(50) DEFAULT 'Student';
