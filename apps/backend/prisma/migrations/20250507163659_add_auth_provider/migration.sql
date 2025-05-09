-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('credentials', 'google', 'github');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'credentials';
