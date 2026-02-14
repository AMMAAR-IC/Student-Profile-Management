-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "first_name" TEXT,
    "last_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "student_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "date_of_birth" DATETIME,
    "enrollment_date" DATETIME,
    "major" TEXT,
    "current_gpa" REAL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "address" TEXT,
    "emergency_contact" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" TEXT,
    CONSTRAINT "students_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "academic_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "student_id" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "course_code" TEXT NOT NULL,
    "course_name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "gpa_contribution" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "academic_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "student_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    CONSTRAINT "documents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_interactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "agent_type" TEXT NOT NULL,
    "context" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "changes" TEXT,
    "ip_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_student_id_key" ON "students"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE INDEX "students_major_idx" ON "students"("major");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE INDEX "students_current_gpa_idx" ON "students"("current_gpa");

-- CreateIndex
CREATE INDEX "students_first_name_last_name_idx" ON "students"("first_name", "last_name");

-- CreateIndex
CREATE INDEX "academic_records_student_id_idx" ON "academic_records"("student_id");

-- CreateIndex
CREATE INDEX "academic_records_course_code_idx" ON "academic_records"("course_code");

-- CreateIndex
CREATE INDEX "documents_student_id_idx" ON "documents"("student_id");

-- CreateIndex
CREATE INDEX "ai_interactions_user_id_idx" ON "ai_interactions"("user_id");

-- CreateIndex
CREATE INDEX "ai_interactions_agent_type_idx" ON "ai_interactions"("agent_type");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
