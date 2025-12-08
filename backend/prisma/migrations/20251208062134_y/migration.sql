/*
  Warnings:

  - You are about to drop the column `maxHeight` on the `Dock` table. All the data in the column will be lost.
  - You are about to drop the column `maxLength` on the `Dock` table. All the data in the column will be lost.
  - You are about to drop the column `maxWidth` on the `Dock` table. All the data in the column will be lost.
  - You are about to drop the column `supportedVehicleTypes` on the `Dock` table. All the data in the column will be lost.
  - You are about to drop the column `dimensionHeight` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `dimensionLength` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `dimensionWidth` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `isReefer` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `jenisKendaraan` on the `Vehicle` table. All the data in the column will be lost.
  - The `maxCapacity` column on the `Vehicle` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `requiresDock` column on the `Vehicle` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `dockType` to the `Dock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleType` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DockType" AS ENUM ('MANUAL', 'FORKLIFT', 'SIDE', 'REEFER');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('PICKUP', 'CDE', 'CDD', 'FUSO', 'TRONTON', 'WINGBOX', 'CONTAINER20', 'CONTAINER40');

-- CreateEnum
CREATE TYPE "DockRequirement" AS ENUM ('NONE', 'FORKLIFT', 'SIDE', 'REEFER');

-- AlterTable
ALTER TABLE "Dock" DROP COLUMN "maxHeight",
DROP COLUMN "maxLength",
DROP COLUMN "maxWidth",
DROP COLUMN "supportedVehicleTypes",
ADD COLUMN     "allowedTypes" "VehicleType"[],
DROP COLUMN "dockType",
ADD COLUMN     "dockType" "DockType" NOT NULL;

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "dimensionHeight",
DROP COLUMN "dimensionLength",
DROP COLUMN "dimensionWidth",
DROP COLUMN "isReefer",
DROP COLUMN "jenisKendaraan",
ADD COLUMN     "vehicleType" "VehicleType" NOT NULL,
DROP COLUMN "maxCapacity",
ADD COLUMN     "maxCapacity" INTEGER,
DROP COLUMN "requiresDock",
ADD COLUMN     "requiresDock" "DockRequirement" NOT NULL DEFAULT 'NONE';
