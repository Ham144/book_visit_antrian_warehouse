/*
  Warnings:

  - The values [CUSTOMDAY] on the enum `Recurring` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `finishTime` on the `Booking` table. All the data in the column will be lost.
  - Changed the type of `status` on the `Booking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'FINISHED', 'CANCELED');

-- AlterEnum
BEGIN;
CREATE TYPE "Recurring_new" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');
ALTER TABLE "DockBusyTime" ALTER COLUMN "recurring" TYPE "Recurring_new" USING ("recurring"::text::"Recurring_new");
ALTER TYPE "Recurring" RENAME TO "Recurring_old";
ALTER TYPE "Recurring_new" RENAME TO "Recurring";
DROP TYPE "public"."Recurring_old";
COMMIT;

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "finishTime",
ADD COLUMN     "actualFinishTime" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "BookingStatus" NOT NULL;
