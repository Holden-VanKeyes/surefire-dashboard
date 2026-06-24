-- CreateTable
CREATE TABLE "LearnerSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "timeZone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityAttempt" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "launchId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "activityCompleted" BOOLEAN NOT NULL DEFAULT false,
    "activityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activityElapsed" INTEGER NOT NULL DEFAULT 0,
    "activityFailures" INTEGER NOT NULL DEFAULT 0,
    "sessionOutcome" TEXT,
    "debriefings" TEXT[],
    "rawPayload" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "ActivityAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearnerSession_userId_stationId_courseId_key" ON "LearnerSession"("userId", "stationId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityAttempt_requestId_key" ON "ActivityAttempt"("requestId");

-- AddForeignKey
ALTER TABLE "ActivityAttempt" ADD CONSTRAINT "ActivityAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LearnerSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
