-- CreateTable
CREATE TABLE "userotps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userotps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "userotps" ADD CONSTRAINT "userotps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
