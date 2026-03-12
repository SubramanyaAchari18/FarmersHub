/*
  Warnings:

  - Added the required column `quantityKg` to the `TransportationRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `TransportationRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'confirmed';
ALTER TYPE "OrderStatus" ADD VALUE 'completed';

-- AlterTable
ALTER TABLE "TransportationRequest" ADD COLUMN     "quantityKg" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "totalPrice" DECIMAL(65,30) NOT NULL;
