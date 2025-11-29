/*
  Warnings:

  - Added the required column `recurring` to the `DockBusyTime` table without a default value. This is not possible if the table is not empty.
  - Made the column `reason` on table `DockBusyTime` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Days" AS ENUM ('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU');

-- AlterEnum
ALTER TYPE "Recurring" ADD VALUE 'CUSTOMDAY';

-- AlterTable
ALTER TABLE "DockBusyTime" ADD COLUMN     "recurring" "Recurring" NOT NULL,
ADD COLUMN     "recurringCustom" "Days"[],
ADD COLUMN     "recurringStep" INTEGER,
ALTER COLUMN "reason" SET NOT NULL;
