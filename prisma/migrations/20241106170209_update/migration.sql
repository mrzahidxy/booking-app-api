-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "image" TEXT,
ADD COLUMN     "ratings" TEXT;
