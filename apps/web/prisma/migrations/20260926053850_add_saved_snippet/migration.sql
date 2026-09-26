-- CreateTable
CREATE TABLE "saved_snippets" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "snippetId" INTEGER NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_snippets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_snippets_userId_idx" ON "saved_snippets"("userId");

-- CreateIndex
CREATE INDEX "saved_snippets_snippetId_idx" ON "saved_snippets"("snippetId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_snippets_userId_snippetId_key" ON "saved_snippets"("userId", "snippetId");

-- AddForeignKey
ALTER TABLE "saved_snippets" ADD CONSTRAINT "saved_snippets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_snippets" ADD CONSTRAINT "saved_snippets_snippetId_fkey" FOREIGN KEY ("snippetId") REFERENCES "snippets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
