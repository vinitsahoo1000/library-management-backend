/*
  Warnings:

  - Added the required column `authorName` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "authorName" TEXT NOT NULL;
