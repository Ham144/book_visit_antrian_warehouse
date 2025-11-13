/*
  Warnings:

  - You are about to drop the column `AD_BASE_DN` on the `Globalsetting` table. All the data in the column will be lost.
  - You are about to drop the column `AD_DOMAIN` on the `Globalsetting` table. All the data in the column will be lost.
  - You are about to drop the column `AD_HOST` on the `Globalsetting` table. All the data in the column will be lost.
  - You are about to drop the column `AD_PORT` on the `Globalsetting` table. All the data in the column will be lost.
  - You are about to drop the column `SOAP_CUSTOMER_PASSWORD` on the `Globalsetting` table. All the data in the column will be lost.
  - You are about to drop the column `SOAP_CUSTOMER_SOAPACTION` on the `Globalsetting` table. All the data in the column will be lost.
  - You are about to drop the column `SOAP_CUSTOMER_URL` on the `Globalsetting` table. All the data in the column will be lost.
  - You are about to drop the column `SOAP_CUSTOMER_USERNAME` on the `Globalsetting` table. All the data in the column will be lost.
  - You are about to drop the column `globalSetting` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the `_GlobalsettingToOrganization` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_GlobalsettingToOrganization" DROP CONSTRAINT "_GlobalsettingToOrganization_A_fkey";

-- DropForeignKey
ALTER TABLE "_GlobalsettingToOrganization" DROP CONSTRAINT "_GlobalsettingToOrganization_B_fkey";

-- AlterTable
ALTER TABLE "Globalsetting" DROP COLUMN "AD_BASE_DN",
DROP COLUMN "AD_DOMAIN",
DROP COLUMN "AD_HOST",
DROP COLUMN "AD_PORT",
DROP COLUMN "SOAP_CUSTOMER_PASSWORD",
DROP COLUMN "SOAP_CUSTOMER_SOAPACTION",
DROP COLUMN "SOAP_CUSTOMER_URL",
DROP COLUMN "SOAP_CUSTOMER_USERNAME";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "globalSetting",
ADD COLUMN     "AD_BASE_DN" TEXT,
ADD COLUMN     "AD_DOMAIN" TEXT,
ADD COLUMN     "AD_HOST" TEXT,
ADD COLUMN     "AD_PORT" TEXT;

-- DropTable
DROP TABLE "_GlobalsettingToOrganization";
