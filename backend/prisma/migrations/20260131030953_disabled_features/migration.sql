/*
  Warnings:

  - Added the required column `status` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Globalsetting" ADD COLUMN     "activeAuthentication" TEXT[] DEFAULT ARRAY['APP', 'AD']::TEXT[];

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "disabledFeatures" TEXT[] DEFAULT ARRAY['chat']::TEXT[];
