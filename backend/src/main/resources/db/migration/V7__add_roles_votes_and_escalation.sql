-- Migration V7: Add staff_admin_role to users, votes and escalation tracking to complaints
-- 1. Add staff admin role columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_admin_role VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_admin_role_other VARCHAR(100);

-- 2. Add escalation and upvote tracking columns to complaints
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS escalation_level INT NOT NULL DEFAULT 0;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS escalated_to UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS upvote_count INT NOT NULL DEFAULT 0;

-- 3. Create complaint_votes table for community upvoting
CREATE TABLE IF NOT EXISTS complaint_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_complaint_user_vote UNIQUE (complaint_id, user_id)
);

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_complaints_escalation_level ON complaints(escalation_level);
CREATE INDEX IF NOT EXISTS idx_complaints_upvote_count ON complaints(upvote_count DESC);
CREATE INDEX IF NOT EXISTS idx_complaint_votes_complaint_id ON complaint_votes(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_votes_user_id ON complaint_votes(user_id);
