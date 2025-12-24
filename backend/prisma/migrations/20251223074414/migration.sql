/*
  Warnings:

  - The values [CONTAINER20,CONTAINER40] on the enum `VehicleType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `dockType` on the `Dock` table. All the data in the column will be lost.
  - You are about to drop the column `requiresDock` on the `Vehicle` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VehicleType_new" AS ENUM ('PICKUP', 'PICKUP_BOX', 'GRANDMAX_PICKUP', 'GRANDMAX_BOX', 'VAN', 'CDE', 'CDD', 'CDD_BOX', 'FUSO', 'FUSO_BOX', 'TRONTON', 'TRONTON_BOX', 'CONTAINER_20', 'CONTAINER_40', 'WINGBOX', 'TANKER', 'FLATBED');
ALTER TABLE "Vehicle" ALTER COLUMN "vehicleType" TYPE "VehicleType_new" USING ("vehicleType"::text::"VehicleType_new");
ALTER TABLE "Dock" ALTER COLUMN "allowedTypes" TYPE "VehicleType_new"[] USING ("allowedTypes"::text::"VehicleType_new"[]);
ALTER TYPE "VehicleType" RENAME TO "VehicleType_old";
ALTER TYPE "VehicleType_new" RENAME TO "VehicleType";
DROP TYPE "public"."VehicleType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Dock" DROP COLUMN "dockType";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "description" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "requiresDock";

-- DropEnum
DROP TYPE "DockRequirement";

-- DropEnum
DROP TYPE "DockType";
