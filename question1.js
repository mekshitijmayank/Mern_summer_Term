// Student Data
const students = [
  { id: 1, name: "Aman", marks: 85, attendance: 92 },
  { id: 2, name: "Riya", marks: 38, attendance: 76 },
  { id: 3, name: "Karan", marks: 67, attendance: 81 },
  { id: 4, name: "Simran", marks: 91, attendance: 88 },
  { id: 5, name: "Raj", marks: 45, attendance: 60 },
  { id: 6, name: "Neha", marks: 29, attendance: 95 }
];

// 1. List of passed students
const passedStudents = students.filter(({ marks }) => marks >= 40);

// 2. Student report with grades
const studentReport = students.map(({ name, marks, attendance }) => {
  let grade;

  if (marks >= 80) {
    grade = "A";
  } else if (marks >= 60) {
    grade = "B";
  } else if (marks >= 40) {
    grade = "C";
  } else {
    grade = "F";
  }

  return { name, marks, attendance, grade };
});

// 3. Class average marks
const averageMarks =
  students.reduce((sum, { marks }) => sum + marks, 0) / students.length;

// 4. Topper of the class
const topper = students.reduce((bestStudent, currentStudent) =>
  currentStudent.marks > bestStudent.marks
    ? currentStudent
    : bestStudent
);

//5. Display Results
console.log("===== PASSED STUDENTS =====");
passedStudents.forEach(({ name, marks }) => {
  console.log(`${name} - ${marks} marks`);
});

console.log("\n===== STUDENT REPORT =====");
studentReport.forEach(({ name, marks, attendance, grade }) => {
  console.log(
    `Name: ${name}, Marks: ${marks}, Attendance: ${attendance}%, Grade: ${grade}`
  );
});

console.log("\n===== CLASS AVERAGE =====");
console.log(`Average Marks: ${averageMarks.toFixed(2)}`);

console.log("\n===== TOPPER =====");
console.log(`Topper: ${topper.name}`);
console.log(`Marks: ${topper.marks}`);