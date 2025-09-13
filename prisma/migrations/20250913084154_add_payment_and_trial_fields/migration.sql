-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'FAILED');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "trialUsed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "xenditInvoiceId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "subscriptionType" "public"."SubscriptionType" NOT NULL,
    "externalId" TEXT NOT NULL,
    "invoiceUrl" TEXT,
    "paymentMethod" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_xenditInvoiceId_key" ON "public"."Payment"("xenditInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_externalId_key" ON "public"."Payment"("externalId");

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
