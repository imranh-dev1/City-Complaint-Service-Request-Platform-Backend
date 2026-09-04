/*
  Warnings:

  - You are about to drop the `technician_profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "technician_profiles" DROP CONSTRAINT "technician_profiles_userId_fkey";

-- DropTable
DROP TABLE "technician_profiles";

-- CreateTable
CREATE TABLE "citizens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nid" TEXT,
    "address" TEXT,
    "wardNo" TEXT,
    "area" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citizens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicians" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalJobs" INTEGER NOT NULL DEFAULT 0,
    "availability" "TechAvailability" NOT NULL DEFAULT 'AVAILABLE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "serviceRadius" INTEGER NOT NULL DEFAULT 10,
    "hourlyRate" DOUBLE PRECISION,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "citizens_userId_key" ON "citizens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "citizens_nid_key" ON "citizens"("nid");

-- CreateIndex
CREATE INDEX "citizens_userId_idx" ON "citizens"("userId");

-- CreateIndex
CREATE INDEX "citizens_wardNo_idx" ON "citizens"("wardNo");

-- CreateIndex
CREATE UNIQUE INDEX "technicians_userId_key" ON "technicians"("userId");

-- CreateIndex
CREATE INDEX "technicians_userId_idx" ON "technicians"("userId");

-- CreateIndex
CREATE INDEX "technicians_specialization_idx" ON "technicians"("specialization");

-- CreateIndex
CREATE INDEX "technicians_availability_idx" ON "technicians"("availability");

-- AddForeignKey
ALTER TABLE "citizens" ADD CONSTRAINT "citizens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
