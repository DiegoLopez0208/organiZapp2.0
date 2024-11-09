/*
  Warnings:

  - You are about to drop the column `createdAt` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `taskuser_id` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.
  - Added the required column `created_at` to the `task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `task_user_id` to the `task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `update_at` to the `task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_at` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `update_at` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_taskuser_id_fkey";

-- AlterTable
ALTER TABLE "task" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "taskuser_id",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "task_user_id" INTEGER NOT NULL,
ADD COLUMN     "update_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "delete_At" TIMESTAMP(3),
ADD COLUMN     "update_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_task_user_id_fkey" FOREIGN KEY ("task_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
