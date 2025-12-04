/*
  Warnings:

  - Added the required column `counterId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "counterId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Counter" (
    "id" SERIAL NOT NULL,
    "organizationName" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "dockId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sequence_value" INTEGER NOT NULL,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Counter_organizationName_warehouseId_dockId_date_key" ON "Counter"("organizationName", "warehouseId", "dockId", "date");
