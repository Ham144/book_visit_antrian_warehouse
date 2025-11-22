/*
  Warnings:

  - You are about to drop the column `status` on the `Dock` table. All the data in the column will be lost.
  - You are about to alter the column `maxLength` on the `Dock` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `maxWidth` on the `Dock` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `maxHeight` on the `Dock` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `organizationName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationName` to the `Dock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationName` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "organizationName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Dock" DROP COLUMN "status",
ADD COLUMN     "organizationName" TEXT NOT NULL,
ALTER COLUMN "maxLength" SET DATA TYPE INTEGER,
ALTER COLUMN "maxWidth" SET DATA TYPE INTEGER,
ALTER COLUMN "maxHeight" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "organizationName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Dock" ADD CONSTRAINT "Dock_organizationName_fkey" FOREIGN KEY ("organizationName") REFERENCES "Organization"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_organizationName_fkey" FOREIGN KEY ("organizationName") REFERENCES "Organization"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_organizationName_fkey" FOREIGN KEY ("organizationName") REFERENCES "Organization"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
