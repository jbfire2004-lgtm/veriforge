ALTER TABLE "TrainingRecord" ADD COLUMN IF NOT EXISTS "certificateSignedAt" TIMESTAMP(3);
ALTER TABLE "TrainingRecord" ADD COLUMN IF NOT EXISTS "certificateSignedByInstructorId" INTEGER;

ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_certificateSignedByInstructorId_fkey"
  FOREIGN KEY ("certificateSignedByInstructorId") REFERENCES "TrainingInstructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
