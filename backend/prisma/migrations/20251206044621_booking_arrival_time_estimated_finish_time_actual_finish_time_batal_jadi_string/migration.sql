/*
  Warnings:

  - The `estimatedFinishTime` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `actualFinishTime` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `arrivalTime` on the `Booking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "arrivalTime",
ADD COLUMN     "arrivalTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "estimatedFinishTime",
ADD COLUMN     "estimatedFinishTime" TIMESTAMP(3),
DROP COLUMN "actualFinishTime",
ADD COLUMN     "actualFinishTime" TIMESTAMP(3);
