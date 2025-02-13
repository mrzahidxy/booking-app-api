-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_hotelId_fkey";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "hotelId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
