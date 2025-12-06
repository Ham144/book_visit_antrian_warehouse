/*
  Warnings:

  - You are about to drop the column `days` on the `Vacant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dockId,day]` on the table `Vacant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "DockBusyTime" DROP CONSTRAINT "DockBusyTime_dockId_fkey";

-- DropForeignKey
ALTER TABLE "Vacant" DROP CONSTRAINT "Vacant_dockId_fkey";

-- AlterTable
ALTER TABLE "Vacant" DROP COLUMN "days",
ADD COLUMN     "day" "Days",
ALTER COLUMN "dockId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vacant_dockId_day_key" ON "Vacant"("dockId", "day");

-- AddForeignKey
ALTER TABLE "Vacant" ADD CONSTRAINT "Vacant_dockId_fkey" FOREIGN KEY ("dockId") REFERENCES "Dock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DockBusyTime" ADD CONSTRAINT "DockBusyTime_dockId_fkey" FOREIGN KEY ("dockId") REFERENCES "Dock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
