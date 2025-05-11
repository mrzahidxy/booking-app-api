/*
  Warnings:

  - The `cuisine` column on the `Restaurant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `menu` column on the `Restaurant` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "cuisine",
ADD COLUMN     "cuisine" TEXT[],
DROP COLUMN "menu",
ADD COLUMN     "menu" JSONB;
