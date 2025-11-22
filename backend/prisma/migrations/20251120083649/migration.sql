/*
  Warnings:

  - You are about to drop the `UserWarehouseAccess` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserWarehouseAccess" DROP CONSTRAINT "UserWarehouseAccess_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserWarehouseAccess" DROP CONSTRAINT "UserWarehouseAccess_warehouseId_fkey";

-- DropTable
DROP TABLE "UserWarehouseAccess";

-- CreateTable
CREATE TABLE "_UserToWarehouse" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserToWarehouse_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserToWarehouse_B_index" ON "_UserToWarehouse"("B");

-- AddForeignKey
ALTER TABLE "_UserToWarehouse" ADD CONSTRAINT "_UserToWarehouse_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToWarehouse" ADD CONSTRAINT "_UserToWarehouse_B_fkey" FOREIGN KEY ("B") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
