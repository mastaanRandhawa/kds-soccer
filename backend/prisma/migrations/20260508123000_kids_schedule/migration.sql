-- CreateTable
CREATE TABLE "kids_schedule" (
    "id" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "headers" JSONB NOT NULL,
    "rows" JSONB NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kids_schedule_pkey" PRIMARY KEY ("id")
);
