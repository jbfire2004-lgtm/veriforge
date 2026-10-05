ALTER TABLE "Site" ADD COLUMN "code" TEXT;
ALTER TABLE "Site" ADD COLUMN "region" TEXT;

CREATE UNIQUE INDEX "Site_code_key" ON "Site"("code");
