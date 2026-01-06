/*
  Warnings:

  - You are about to drop the column `estimatedFinishTime` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "estimatedFinishTime",
ADD COLUMN     "actualArrivalTime" TIMESTAMP(3),
ADD COLUMN     "actualStartTime" TIMESTAMP(3);
