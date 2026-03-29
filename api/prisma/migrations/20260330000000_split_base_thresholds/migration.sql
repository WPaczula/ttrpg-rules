-- Split base_thresholds string column into major_threshold and severe_threshold integer columns

-- Add new columns with defaults so existing rows are valid
ALTER TABLE "armor" ADD COLUMN "major_threshold" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "armor" ADD COLUMN "severe_threshold" INTEGER NOT NULL DEFAULT 0;

-- Populate from existing data: base_thresholds is "major / severe" e.g. "6 / 13"
UPDATE "armor"
SET "major_threshold" = CAST(TRIM(SPLIT_PART("base_thresholds", '/', 1)) AS INTEGER),
    "severe_threshold" = CAST(TRIM(SPLIT_PART("base_thresholds", '/', 2)) AS INTEGER);

-- Drop the old column
ALTER TABLE "armor" DROP COLUMN "base_thresholds";

-- Remove the defaults now that data is populated
ALTER TABLE "armor" ALTER COLUMN "major_threshold" DROP DEFAULT;
ALTER TABLE "armor" ALTER COLUMN "severe_threshold" DROP DEFAULT;
