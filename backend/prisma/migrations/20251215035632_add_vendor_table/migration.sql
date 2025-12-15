-- AlterTable
ALTER TABLE "User" ADD COLUMN     "vendorName" TEXT;

-- CreateTable
CREATE TABLE "Vendor" (
    "name" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("name")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_vendorName_fkey" FOREIGN KEY ("vendorName") REFERENCES "Vendor"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_organizationName_fkey" FOREIGN KEY ("organizationName") REFERENCES "Organization"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
