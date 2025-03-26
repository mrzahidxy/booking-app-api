/*
  Warnings:

  - The `image` column on the `Hotel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `image` column on the `Room` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Hotel" DROP COLUMN "image",
ADD COLUMN     "image" TEXT[];

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "image",
ADD COLUMN     "image" TEXT[];
