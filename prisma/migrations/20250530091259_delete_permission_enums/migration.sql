/*
  Warnings:

  - Changed the type of `name` on the `Permission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "name",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropEnum
DROP TYPE "PermissionEnum";

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");
