/*
  Warnings:

  - The values [EVENT_INVITATION] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."NotificationType_new" AS ENUM ('FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'EVENT_INVITE', 'EVENT_REMINDER', 'EVENT_UPDATE', 'COMMENT', 'LIKE', 'SYSTEM', 'FOLLOW', 'MENTION', 'BADGE_EARNED', 'POST_PUBLISHED');
ALTER TABLE "public"."Notification" ALTER COLUMN "type" TYPE "public"."NotificationType_new" USING ("type"::text::"public"."NotificationType_new");
ALTER TYPE "public"."NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "public"."NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;
