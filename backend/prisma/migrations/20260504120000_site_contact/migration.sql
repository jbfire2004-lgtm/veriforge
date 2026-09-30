-- CreateTable
CREATE TABLE "SiteContact" (
    "id" SERIAL NOT NULL,
    "siteId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteContact_siteId_idx" ON "SiteContact"("siteId");

-- AddForeignKey
ALTER TABLE "SiteContact" ADD CONSTRAINT "SiteContact_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
