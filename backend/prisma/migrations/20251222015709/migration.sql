/*
  Warnings:

  - You are about to drop the column `counterId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_counterId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_vehicleId_fkey";

-- DropIndex
DROP INDEX "Booking_counterId_key";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "counterId",
ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "vehicleId",
ALTER COLUMN "description" SET DEFAULT 'ADMIN';
