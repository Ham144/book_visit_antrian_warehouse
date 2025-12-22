-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "createByUsername" TEXT;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_createByUsername_fkey" FOREIGN KEY ("createByUsername") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;
