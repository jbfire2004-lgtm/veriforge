-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "category" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "metadata" JSONB;
