-- CreateEnum
CREATE TYPE "EquipmentCondition" AS ENUM ('NEW', 'GOOD', 'USED', 'OBSOLETE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EquipmentCategory" ADD VALUE 'ROBOTICS';
ALTER TYPE "EquipmentCategory" ADD VALUE 'PERIPHERALS';
ALTER TYPE "EquipmentCategory" ADD VALUE 'AUDIO';
ALTER TYPE "EquipmentCategory" ADD VALUE 'COMPONENTS';
ALTER TYPE "EquipmentCategory" ADD VALUE 'TOOLS';
ALTER TYPE "EquipmentCategory" ADD VALUE 'CONSUMABLE';
ALTER TYPE "EquipmentCategory" ADD VALUE 'MISC';

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "docUrl",
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "condition" "EquipmentCondition" NOT NULL DEFAULT 'GOOD',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "internalId" TEXT,
ADD COLUMN     "loanable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "participants" TEXT[],
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "zipUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_internalId_key" ON "Equipment"("internalId");

