-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'REMOVED');

-- CreateEnum
CREATE TYPE "KhatmStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "JuzStatus" AS ENUM ('UNCLAIMED', 'RESERVED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('EMAIL', 'PUSH', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "password_hash" TEXT,
    "avatar" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Khatm" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "niyyah_text" TEXT,
    "niyyah_category" TEXT,
    "status" "KhatmStatus" NOT NULL DEFAULT 'ACTIVE',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "started_by" UUID NOT NULL,

    CONSTRAINT "Khatm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JuzAssignment" (
    "id" UUID NOT NULL,
    "khatm_id" UUID NOT NULL,
    "juz_number" INTEGER NOT NULL,
    "reserved_by" UUID,
    "status" "JuzStatus" NOT NULL DEFAULT 'UNCLAIMED',
    "reserved_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "JuzAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "khatm_id" UUID,
    "user_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" UUID NOT NULL,
    "juz_assignment_id" UUID NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "channel" "Channel" NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "Membership_user_id_family_id_idx" ON "Membership"("user_id", "family_id");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_user_id_family_id_key" ON "Membership"("user_id", "family_id");

-- CreateIndex
CREATE INDEX "JuzAssignment_khatm_id_juz_number_idx" ON "JuzAssignment"("khatm_id", "juz_number");

-- CreateIndex
CREATE UNIQUE INDEX "JuzAssignment_khatm_id_juz_number_key" ON "JuzAssignment"("khatm_id", "juz_number");

-- AddForeignKey
ALTER TABLE "Family" ADD CONSTRAINT "Family_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Khatm" ADD CONSTRAINT "Khatm_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Khatm" ADD CONSTRAINT "Khatm_started_by_fkey" FOREIGN KEY ("started_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuzAssignment" ADD CONSTRAINT "JuzAssignment_khatm_id_fkey" FOREIGN KEY ("khatm_id") REFERENCES "Khatm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuzAssignment" ADD CONSTRAINT "JuzAssignment_reserved_by_fkey" FOREIGN KEY ("reserved_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_khatm_id_fkey" FOREIGN KEY ("khatm_id") REFERENCES "Khatm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_juz_assignment_id_fkey" FOREIGN KEY ("juz_assignment_id") REFERENCES "JuzAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
