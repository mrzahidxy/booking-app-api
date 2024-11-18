/*
  Warnings:

  - Made the column `cuisine` on table `Restaurant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Restaurant" ALTER COLUMN "cuisine" SET NOT NULL;
