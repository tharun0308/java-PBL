-- V5: Add index on complaints.priority for fast aggregate grouping and filtering
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
