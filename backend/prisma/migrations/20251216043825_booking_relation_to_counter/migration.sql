/*
  Warnings:

  - The primary key for the `Counter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[counterId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "counterId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Counter" DROP CONSTRAINT "Counter_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Counter_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Counter_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Booking_counterId_key" ON "Booking"("counterId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "Counter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
