/*
  Warnings:

  - You are about to drop the column `driverId` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `driverUsername` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('APP', 'AD');

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_driverId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "driverId",
ADD COLUMN     "driverUsername" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'AD';

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_driverUsername_fkey" FOREIGN KEY ("driverUsername") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
