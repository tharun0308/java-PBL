-- Migration V4: Add staff_admin_document_path and staff_admin_department columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_admin_document_path VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_admin_department VARCHAR(255);
