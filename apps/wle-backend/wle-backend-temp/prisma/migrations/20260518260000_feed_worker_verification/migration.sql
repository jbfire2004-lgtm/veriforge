-- Add WORKER_VERIFICATION feed source for Vera Core validation events
ALTER TYPE "FeedSource" ADD VALUE IF NOT EXISTS 'WORKER_VERIFICATION';
