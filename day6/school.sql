PRAGMA foreign_keys = ON;

-- ---------- TABLES ----------

CREATE TABLE students (
  student_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
  course_id INTEGER PRIMARY KEY,
  title     TEXT NOT NULL,
  credits   INTEGER NOT NULL
);

CREATE TABLE enrolments (
  enrolment_id INTEGER PRIMARY KEY,
  student_id   INTEGER NOT NULL,
  course_id    INTEGER NOT NULL,
  grade        TEXT,
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (course_id)  REFERENCES courses(course_id),
  UNIQUE (student_id, course_id)  -- same student cannot enrol on the same course twice
);

-- ---------- SAMPLE DATA ----------

INSERT INTO students (student_id, name, email) VALUES
  (1, 'Amina Otieno', 'amina@example.com'),
  (2, 'Brian Kamau',  'brian@example.com'),
  (3, 'Grace Mwangi', 'grace@example.com'),
  (4, 'David Njoroge', 'david@example.com');

INSERT INTO courses (course_id, title, credits) VALUES
  (1, 'Web Development', 4),
  (2, 'Databases',       3),
  (3, 'Data Structures', 4);

INSERT INTO enrolments (enrolment_id, student_id, course_id, grade) VALUES
  (1, 1, 1, 'A'),
  (2, 1, 2, 'B'),
  (3, 2, 1, 'B'),
  (4, 2, 3, 'C'),
  (5, 3, 2, 'A');

-- ---------- QUERIES ----------

-- 1. All courses for one student (by name)
SELECT courses.title, enrolments.grade
FROM students
JOIN enrolments ON students.student_id = enrolments.student_id
JOIN courses    ON enrolments.course_id = courses.course_id
WHERE students.name = 'Amina Otieno';

-- 2. All students on one course
SELECT students.name, students.email
FROM courses
JOIN enrolments ON courses.course_id = enrolments.course_id
JOIN students   ON enrolments.student_id = students.student_id
WHERE courses.title = 'Web Development';

-- 3. Number of students per course
SELECT courses.title, COUNT(enrolments.student_id) AS student_count
FROM courses
LEFT JOIN enrolments ON courses.course_id = enrolments.course_id
GROUP BY courses.course_id, courses.title;

-- 4. Students who have no enrolments
SELECT students.name
FROM students
LEFT JOIN enrolments ON students.student_id = enrolments.student_id
WHERE enrolments.enrolment_id IS NULL;

-- 5. Update one enrolment's grade
UPDATE enrolments
SET grade = 'A'
WHERE student_id = 2 AND course_id = 3;

-- Check the update
SELECT * FROM enrolments WHERE student_id = 2 AND course_id = 3;