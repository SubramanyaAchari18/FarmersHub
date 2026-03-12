-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('farmer', 'buyer');

-- CreateEnum
CREATE TYPE "CropCategory" AS ENUM ('grains', 'vegetables', 'fruits', 'pulses', 'spices', 'others');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'picked_up', 'in_transit', 'delivered', 'cancelled');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "village" TEXT,
    "taluk" TEXT,
    "district" TEXT,
    "state" TEXT,
    "profilePhotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "AppRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" UUID NOT NULL,
    "farmerId" UUID NOT NULL,
    "cropName" TEXT NOT NULL,
    "category" "CropCategory" NOT NULL,
    "quantityKg" DECIMAL(65,30) NOT NULL,
    "pricePerKg" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "locationVillage" TEXT NOT NULL,
    "locationTaluk" TEXT,
    "locationDistrict" TEXT NOT NULL,
    "locationState" TEXT NOT NULL,
    "imageUrl" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportationRequest" (
    "id" UUID NOT NULL,
    "cropId" UUID NOT NULL,
    "farmerId" UUID NOT NULL,
    "buyerId" UUID,
    "pickupLocation" TEXT NOT NULL,
    "deliveryLocation" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "trackingNotes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickedUpAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransportationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricePrediction" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "cropName" TEXT NOT NULL,
    "category" "CropCategory" NOT NULL,
    "locationState" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "predictedPricePerKg" DECIMAL(65,30) NOT NULL,
    "confidenceScore" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricePrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" UUID NOT NULL,
    "farmerId" UUID NOT NULL,
    "buyerId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_role_key" ON "UserRole"("userId", "role");

-- CreateIndex
CREATE INDEX "Crop_farmerId_idx" ON "Crop"("farmerId");

-- CreateIndex
CREATE INDEX "Crop_category_idx" ON "Crop"("category");

-- CreateIndex
CREATE INDEX "Crop_available_idx" ON "Crop"("available");

-- CreateIndex
CREATE INDEX "Crop_locationState_locationDistrict_idx" ON "Crop"("locationState", "locationDistrict");

-- CreateIndex
CREATE INDEX "TransportationRequest_farmerId_idx" ON "TransportationRequest"("farmerId");

-- CreateIndex
CREATE INDEX "TransportationRequest_buyerId_idx" ON "TransportationRequest"("buyerId");

-- CreateIndex
CREATE INDEX "Rating_farmerId_idx" ON "Rating"("farmerId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportationRequest" ADD CONSTRAINT "TransportationRequest_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportationRequest" ADD CONSTRAINT "TransportationRequest_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportationRequest" ADD CONSTRAINT "TransportationRequest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricePrediction" ADD CONSTRAINT "PricePrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
