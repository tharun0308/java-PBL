-- V6__add_custom_category_and_complaint_photos.sql
-- Add custom category field and attached defect photo paths to complaints

ALTER TABLE complaints
    ADD COLUMN IF NOT EXISTS custom_category VARCHAR(100),
    ADD COLUMN IF NOT EXISTS photo_paths VARCHAR(1000);
