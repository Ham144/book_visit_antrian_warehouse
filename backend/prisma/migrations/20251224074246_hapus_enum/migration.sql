/*
  Warnings:

  - The `allowedTypes` column on the `Dock` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `recurringCustom` column on the `DockBusyTime` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `plan` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `accountType` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `Booking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `recurring` on the `DockBusyTime` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `day` to the `Vacant` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `vehicleType` on the `Vehicle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Dock" DROP COLUMN "allowedTypes",
ADD COLUMN     "allowedTypes" TEXT[];

-- AlterTable
ALTER TABLE "DockBusyTime" DROP COLUMN "recurring",
ADD COLUMN     "recurring" TEXT NOT NULL,
DROP COLUMN "recurringCustom",
ADD COLUMN     "recurringCustom" TEXT[];

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "plan",
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'TRIAL';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accountType",
ADD COLUMN     "accountType" TEXT NOT NULL DEFAULT 'AD',
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'DRIVER_VENDOR';

-- AlterTable
ALTER TABLE "Vacant" DROP COLUMN "day",
ADD COLUMN     "day" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "vehicleType",
ADD COLUMN     "vehicleType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "AccountType";

-- DropEnum
DROP TYPE "BookingStatus";

-- DropEnum
DROP TYPE "Days";

-- DropEnum
DROP TYPE "ROLE";

-- DropEnum
DROP TYPE "Recurring";

-- DropEnum
DROP TYPE "SubscriptionPlan";

-- DropEnum
DROP TYPE "VehicleType";

-- CreateIndex
CREATE UNIQUE INDEX "Vacant_dockId_day_key" ON "Vacant"("dockId", "day");
