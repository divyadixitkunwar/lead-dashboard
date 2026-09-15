-- AlterTable
ALTER TABLE "messages" ADD COLUMN "platform_message_id" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "messages_platform_message_id_key" ON "messages"("platform_message_id");
