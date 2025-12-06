/*
  Warnings:

  - You are about to drop the column `availableFrom` on the `Dock` table. All the data in the column will be lost.
  - You are about to drop the column `availableUntil` on the `Dock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Dock" DROP COLUMN "availableFrom",
DROP COLUMN "availableUntil";

-- CreateTable
CREATE TABLE "Vacant" (
    "id" TEXT NOT NULL,
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "availableUntil" TIMESTAMP(3) NOT NULL,
    "dockId" TEXT NOT NULL,
    "days" "Days"[],

    CONSTRAINT "Vacant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vacant" ADD CONSTRAINT "Vacant_dockId_fkey" FOREIGN KEY ("dockId") REFERENCES "Dock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
