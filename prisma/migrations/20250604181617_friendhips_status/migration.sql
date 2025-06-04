/*
  Warnings:

  - Added the required column `status` to the `Friendship` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FriendshipStatuses" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Friendship" ADD COLUMN     "status" "FriendshipStatuses" NOT NULL;
