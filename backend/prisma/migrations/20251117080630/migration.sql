/*
  Warnings:

  - You are about to drop the column `date` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `day` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `driverId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `koridorId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `loadingTime` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `plat` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `queue` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `slotId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `warehouseId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `BusyTime` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OrganizationToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[plateNumber]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `arrivalTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Dock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plateNumber` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Made the column `brand` on table `Vehicle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `jenisKendaraan` on table `Vehicle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `durasiBongkar` on table `Vehicle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userusername_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationToUser" DROP CONSTRAINT "_OrganizationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationToUser" DROP CONSTRAINT "_OrganizationToUser_B_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "date",
DROP COLUMN "day",
DROP COLUMN "driverId",
DROP COLUMN "endTime",
DROP COLUMN "koridorId",
DROP COLUMN "loadingTime",
DROP COLUMN "plat",
DROP COLUMN "queue",
DROP COLUMN "slotId",
DROP COLUMN "startTime",
ADD COLUMN     "arrivalTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dockId" TEXT,
ADD COLUMN     "estimatedFinishTime" TIMESTAMP(3),
ADD COLUMN     "finishTime" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Dock" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dockType" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxHeight" DOUBLE PRECISION,
ADD COLUMN     "maxLength" DOUBLE PRECISION,
ADD COLUMN     "maxWidth" DOUBLE PRECISION,
ADD COLUMN     "priority" INTEGER,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "supportedVehicleTypes" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "warehouseId",
ADD COLUMN     "homeWarehouseId" TEXT,
ADD COLUMN     "passwordHash" TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dimensionHeight" DOUBLE PRECISION,
ADD COLUMN     "dimensionLength" DOUBLE PRECISION,
ADD COLUMN     "dimensionWidth" DOUBLE PRECISION,
ADD COLUMN     "driverLicense" TEXT,
ADD COLUMN     "driverName" TEXT,
ADD COLUMN     "driverPhone" TEXT,
ADD COLUMN     "isReefer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxCapacity" TEXT,
ADD COLUMN     "plateNumber" TEXT NOT NULL,
ADD COLUMN     "productionYear" INTEGER,
ADD COLUMN     "requiresDock" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "brand" SET NOT NULL,
ALTER COLUMN "jenisKendaraan" SET NOT NULL,
ALTER COLUMN "durasiBongkar" SET NOT NULL;

-- AlterTable
ALTER TABLE "Warehouse" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "BusyTime";

-- DropTable
DROP TABLE "_OrganizationToUser";

-- DropEnum
DROP TYPE "AuthMethod";

-- CreateTable
CREATE TABLE "DockBusyTime" (
    "id" TEXT NOT NULL,
    "dockId" TEXT NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DockBusyTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWarehouseAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserWarehouseAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserWarehouseAccess_userId_warehouseId_key" ON "UserWarehouseAccess"("userId", "warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "Vehicle"("plateNumber");

-- AddForeignKey
ALTER TABLE "DockBusyTime" ADD CONSTRAINT "DockBusyTime_dockId_fkey" FOREIGN KEY ("dockId") REFERENCES "Dock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_dockId_fkey" FOREIGN KEY ("dockId") REFERENCES "Dock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_homeWarehouseId_fkey" FOREIGN KEY ("homeWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWarehouseAccess" ADD CONSTRAINT "UserWarehouseAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWarehouseAccess" ADD CONSTRAINT "UserWarehouseAccess_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
