/*
  Warnings:

  - You are about to drop the column `plateNumber` on the `Vehicle` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Vehicle_plateNumber_key";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "plateNumber";
