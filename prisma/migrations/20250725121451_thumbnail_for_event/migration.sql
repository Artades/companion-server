/*
  Warnings:

  - You are about to drop the column `image` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[thumbnailId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Made the column `cityId` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_cityId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "image",
ADD COLUMN     "thumbnailId" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "cityId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_thumbnailId_key" ON "Event"("thumbnailId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "EventMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
