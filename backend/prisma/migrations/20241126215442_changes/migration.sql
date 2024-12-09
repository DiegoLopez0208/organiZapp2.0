-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_group_id_fkey";

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
