# UniLife Ethiopia — Database Design & Schema Documentation

- **Database Name**: `unilife_ethiopia`
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci` (Full Unicode and Amharic / Ge'ez script support)
- **Engine**: `InnoDB` (ACID transaction compliant, foreign keys, row-level locking)

---

## 1. Table Catalog (26 Normalized Tables)

| # | Table Name | Purpose / Responsibility | Key Relationships |
|---|------------|--------------------------|-------------------|
| 1 | `universities` | Master directory of Ethiopian universities | Lookup table |
| 2 | `departments` | Academic faculties and departments | Lookup table |
| 3 | `users` | Student accounts (private records, passwords) | Primary student entity |
| 4 | `semesters` | Academic semesters per student (e.g., Year 1 Sem I) | Belongs to `users` |
| 5 | `courses` | Course codes, credit hours, instructors, colors | Belongs to `users`, references `semesters` |
| 6 | `timetable_entries`| Weekly class time slots (Mon-Sun), lecture rooms | References `users`, `courses` |
| 7 | `assignments` | Coursework, deadlines, priorities, statuses | References `users`, `courses` |
| 8 | `examinations` | Quizzes, midterms, finals, countdown dates | References `users`, `courses` |
| 9 | `grading_scales` | Configurable grade points per letter (A+, A, B...) | Nullable `user_id` for custom/default |
| 10 | `semester_results` | Course grades, credit hours, retake policies | References `users`, `semesters` |
| 11 | `study_sessions` | Recorded study duration, actual minutes, topics | References `users`, `courses` |
| 12 | `study_goals` | Weekly study hour target (e.g. 15h / week) | 1-to-1 with `users` |
| 13 | `notes` | Student lecture notes, markdown summaries, tags | References `users`, `courses` |
| 14 | `note_attachments` | Uploaded document metadata and mime types | References `notes`, `users` |
| 15 | `attendance_records`| Class attendance log (Attended, Absent, Excused) | References `users`, `courses` |
| 16 | `academic_events` | Personal calendar events, seminars, exams | References `users` |
| 17 | `notifications` | In-app submission alerts and exam notices | References `users` |
| 18 | `donations` | Voluntary community contributions (ETB) | Voluntary support ledger |
| 19 | `admin_roles` | Super Admin, Admin, Moderator role titles | Role definitions |
| 20 | `admin_permissions`| Granular RBAC keys (e.g. `donations.verify`) | Belongs to `admin_roles` |
| 21 | `admin_users` | Separate administrator credentials | References `admin_roles` |
| 22 | `admin_activity_logs`| Immutable audit log for administrative actions | References `admin_users` |
| 23 | `website_announcements`| System notices and maintenance bulletins | Broadcast table |
| 24 | `user_settings` | Student theme, language, and notification flags | 1-to-1 with `users` |
| 25 | `user_activity_events`| Privacy-conscious usage metrics (DAU/MAU) | References `users` |
| 26 | `password_reset_tokens`| Cryptographic tokens with expiration timestamps | References `users` |

---

## 2. Entity Relationship Highlights

1. **Student Isolation**:
   Every student academic table (`courses`, `timetable_entries`, `assignments`, `examinations`, `notes`, `attendance_records`, `study_sessions`, `semester_results`) enforces `user_id INT NOT NULL` with foreign key cascade deletion (`ON DELETE CASCADE`).
   Backend authorization middleware strictly binds all queries with `WHERE user_id = ?`, completely preventing cross-tenant leakage.

2. **Administrator Separation**:
   Administrators are stored in `admin_users`, entirely isolated from student accounts in `users`. A student can never escalate privileges by modifying registration payloads or URLs.

3. **GPA & Retake Policy Support**:
   Table `semester_results` stores:
   - `grade_point DECIMAL(3,2)`
   - `credit_hours DECIMAL(3,1)`
   - `is_retake TINYINT(1)`
   - `retake_mode ENUM('replace','best','average','excluded')`
   Transparent calculations are achieved without silently deleting earlier attempts:
   $$\text{GPA} = \frac{\sum (\text{Credit Hours} \times \text{Grade Points})}{\text{Total Included Credit Hours}}$$

4. **Indexes**:
   Indexes are placed on:
   - `users(email)`, `users(username)`
   - `assignments(user_id, status)`, `assignments(due_date)`
   - `timetable_entries(user_id, day_of_week)`
   - `examinations(user_id, exam_date)`
   - `donations(status)`
   - `notes(user_id, is_pinned)`

---

## 3. MySQL Direct Setup

To import the MySQL schema directly into your database:

```bash
mysql -u root -p < backend/src/db/schema.sql
```
