/*
  Warnings:

  - Made the column `duration` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startTime` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "duration" SET NOT NULL,
ALTER COLUMN "startTime" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
