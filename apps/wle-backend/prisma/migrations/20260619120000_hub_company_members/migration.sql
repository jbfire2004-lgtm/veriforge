-- CreateEnum
CREATE TYPE "HubCompanyMemberRole" AS ENUM ('EMPLOYEE', 'ADMIN', 'FEATURED');

-- CreateTable
CREATE TABLE "hub_company_members" (
    "id" TEXT NOT NULL,
    "companyPageId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "workerId" INTEGER,
    "role" "HubCompanyMemberRole" NOT NULL DEFAULT 'EMPLOYEE',
    "title" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hub_company_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hub_company_members_companyPageId_userId_key" ON "hub_company_members"("companyPageId", "userId");

-- CreateIndex
CREATE INDEX "hub_company_members_userId_idx" ON "hub_company_members"("userId");

-- AddForeignKey
ALTER TABLE "hub_company_members" ADD CONSTRAINT "hub_company_members_companyPageId_fkey" FOREIGN KEY ("companyPageId") REFERENCES "hub_company_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_company_members" ADD CONSTRAINT "hub_company_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
