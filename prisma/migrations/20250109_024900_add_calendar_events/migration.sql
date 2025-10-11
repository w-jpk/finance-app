-- CreateEnum
CREATE TYPE "recurrence_type" AS ENUM ('none', 'daily', 'weekly', 'monthly', 'yearly');

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "event_date" DATE NOT NULL,
    "recurrence" "recurrence_type",
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_calendar_events_user_date" ON "calendar_events"("user_id", "event_date");

-- CreateIndex
CREATE INDEX "idx_calendar_events_user_completed" ON "calendar_events"("user_id", "is_completed");

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON UPDATE NO ACTION;
