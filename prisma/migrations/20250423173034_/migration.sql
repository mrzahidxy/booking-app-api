-- CreateEnum
CREATE TYPE "TimeSlotType" AS ENUM ('MORNING', 'NOON', 'AFTERNOON', 'EVENING', 'NIGHT');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "timeSlots" "TimeSlotType"[];
