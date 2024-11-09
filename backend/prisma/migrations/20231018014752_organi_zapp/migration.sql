/*
  Warnings:

  - You are about to drop the column `birth_year` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `delete_At` on the `user` table. All the data in the column will be lost.
  - Added the required column `birth_date` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "birth_year",
DROP COLUMN "delete_At",
ADD COLUMN     "birth_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "delete_at" TIMESTAMP(3);
