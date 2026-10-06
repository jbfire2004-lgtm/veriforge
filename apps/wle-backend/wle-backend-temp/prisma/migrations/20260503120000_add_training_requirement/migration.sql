-- CreateTable
CREATE TABLE "TrainingRequirement" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "courseName" TEXT NOT NULL,
    "expiresInDays" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingRequirement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrainingRequirement" ADD CONSTRAINT "TrainingRequirement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
