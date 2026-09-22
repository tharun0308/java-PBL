-- Migration V3: Add onboarding_completed, academic_year, and staff_admin_appeal_count columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS academic_year INT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_admin_appeal_count INT NOT NULL DEFAULT 0;

-- Backfill onboarding_completed = TRUE for all existing user rows (preserving existing accounts)
UPDATE users SET onboarding_completed = TRUE WHERE onboarding_completed = FALSE;
