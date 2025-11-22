/*
  Warnings:

  - You are about to drop the column `userusername` on the `Subscription` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Subscription_userusername_key";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "userusername";
