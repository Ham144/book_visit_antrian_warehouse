/*
  Warnings:

  - You are about to drop the column `maxCapacity` on the `Vehicle` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('DRIVER_VENDOR', 'ADMIN_VENDOR', 'ADMIN_ORGANIZATION', 'USER_ORGANIZATION');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "ROLE" NOT NULL DEFAULT 'DRIVER_VENDOR';

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "maxCapacity";
