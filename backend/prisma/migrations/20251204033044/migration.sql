/*
  Warnings:

  - You are about to drop the column `driverName` on the `Vehicle` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_driverName_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "vehicleId" TEXT;

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "driverName";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
