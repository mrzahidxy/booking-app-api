/*
  Warnings:

  - A unique constraint covering the columns `[fcmToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `name` on the `Permission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PermissionEnum" AS ENUM ('CREATE_USER', 'UPDATE_USER', 'GET_USER', 'DELETE_USER', 'CREATE_ROLE', 'UPDATE_ROLE', 'GET_ROLE', 'DELETE_ROLE', 'CREATE_PERMISSION', 'UPDATE_PERMISSION', 'GET_PERMISSION', 'DELETE_PERMISSION', 'ASSIGN_PERMISSION', 'GET_ASSIGNED_PERMISSION', 'ASSIGN_ROLE', 'UPDATE_ASSIGN_ROLE');

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "name",
ADD COLUMN     "name" "PermissionEnum" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fcmToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_fcmToken_key" ON "User"("fcmToken");
