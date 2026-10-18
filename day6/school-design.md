# School Database Design

## Tables

- **students** stores one row per student: an id (primary key), their name and a unique email address.
- **courses** stores one row per course: an id (primary key), the title and the number of credits.
- **enrolments** records the fact that a student is taking a course. Each row has its own id, a `student_id`, a `course_id` and the grade for that student on that course.

## Relationships

- **One-to-many:** one student can have many enrolments, and one course can have many enrolments. Each enrolment belongs to exactly one student and exactly one course.
- **Many-to-many:** students and courses. A student takes many courses, and a course has many students.
- **Why a join table is needed:** a single `students` or `courses` row cannot hold a list of ids without breaking the rules of a relational table. The `enrolments` table solves this by turning one many-to-many relationship into two one-to-many relationships. It is also the natural place to store the grade, because the grade belongs to the pairing of a student and a course, not to either one alone.
- A `UNIQUE (student_id, course_id)` rule stops the same student enrolling on the same course twice.

## Index

I would add an index on `enrolments(course_id)`:

    CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);

Queries such as "all students on one course" and "students per course" filter and group by `course_id`. Without an index, the database scans every enrolment row. With one, it jumps straight to the matching rows, which matters as the number of enrolments grows. (The `UNIQUE (student_id, course_id)` rule already creates an index that helps lookups by student.)

## SQL or NoSQL?

I would choose SQL for this system. The data is clearly structured and relational: students, courses and enrolments always have the same fields and link to each other. SQL enforces that structure with foreign keys, NOT NULL and UNIQUE rules, so a grade cannot point to a student who does not exist and an email cannot be used twice. It also makes questions that cross tables, such as students per course or students with no enrolments, simple to write with JOIN and GROUP BY. A NoSQL document store would suit data with varying shapes or very high write volumes, but a school's records are consistent and accuracy matters more than flexibility.