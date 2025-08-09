/*
  Warnings:

  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `failed_login_attempts` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `ip_address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_locked` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_login_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_password_reset_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_password_reset_token` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password_changed_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profile_image_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `attributePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `documentPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `documents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roleAttributePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rolePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userRole` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "documentPermission" DROP CONSTRAINT "documentPermission_documentId_fkey";

-- DropForeignKey
ALTER TABLE "documentPermission" DROP CONSTRAINT "documentPermission_userId_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "roleAttributePermission" DROP CONSTRAINT "roleAttributePermission_attributePermissionId_fkey";

-- DropForeignKey
ALTER TABLE "roleAttributePermission" DROP CONSTRAINT "roleAttributePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "rolePermission" DROP CONSTRAINT "rolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "rolePermission" DROP CONSTRAINT "rolePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "userRole" DROP CONSTRAINT "userRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "userRole" DROP CONSTRAINT "userRole_userId_fkey";

-- DropIndex
DROP INDEX "users_email_idx";

-- DropIndex
DROP INDEX "users_username_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "created_at",
DROP COLUMN "created_by",
DROP COLUMN "failed_login_attempts",
DROP COLUMN "first_name",
DROP COLUMN "full_name",
DROP COLUMN "ip_address",
DROP COLUMN "is_active",
DROP COLUMN "is_locked",
DROP COLUMN "language",
DROP COLUMN "last_login_at",
DROP COLUMN "last_name",
DROP COLUMN "last_password_reset_at",
DROP COLUMN "last_password_reset_token",
DROP COLUMN "password_changed_at",
DROP COLUMN "password_hash",
DROP COLUMN "phone_number",
DROP COLUMN "profile_image_url",
DROP COLUMN "status",
DROP COLUMN "timezone",
DROP COLUMN "updated_at",
DROP COLUMN "updated_by",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "attributePermission";

-- DropTable
DROP TABLE "documentPermission";

-- DropTable
DROP TABLE "documents";

-- DropTable
DROP TABLE "permission";

-- DropTable
DROP TABLE "roleAttributePermission";

-- DropTable
DROP TABLE "rolePermission";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "userRole";

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
