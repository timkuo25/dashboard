-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('BUG', 'UI', 'MISC');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'VERY_HARD', 'EXTREME');

-- CreateEnum
CREATE TYPE "MiscCategory" AS ENUM ('UI_CHANGE', 'CORE_UPDATE', 'FILE_UPDATE', 'TRANSLATION', 'URL_UPDATE', 'OTHER');

-- CreateTable
CREATE TABLE "WorkEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "EntryType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BugEntry" (
    "id" TEXT NOT NULL,
    "bugUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "workEntryId" TEXT NOT NULL,

    CONSTRAINT "BugEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UIEntry" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "figmaUrl" TEXT NOT NULL,
    "workEntryId" TEXT NOT NULL,

    CONSTRAINT "UIEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MiscEntry" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "MiscCategory" NOT NULL,
    "workEntryId" TEXT NOT NULL,

    CONSTRAINT "MiscEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BugEntry_workEntryId_key" ON "BugEntry"("workEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "UIEntry_workEntryId_key" ON "UIEntry"("workEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "MiscEntry_workEntryId_key" ON "MiscEntry"("workEntryId");

-- AddForeignKey
ALTER TABLE "BugEntry" ADD CONSTRAINT "BugEntry_workEntryId_fkey" FOREIGN KEY ("workEntryId") REFERENCES "WorkEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UIEntry" ADD CONSTRAINT "UIEntry_workEntryId_fkey" FOREIGN KEY ("workEntryId") REFERENCES "WorkEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MiscEntry" ADD CONSTRAINT "MiscEntry_workEntryId_fkey" FOREIGN KEY ("workEntryId") REFERENCES "WorkEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
