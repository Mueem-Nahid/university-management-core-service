const calculateGrade = (marks: number) => {
  let grade = '';
  if (marks >= 0 && marks <= 59) {
    grade = 'F';
  } else if (marks >= 60 && marks <= 69) {
    grade = 'D';
  } else if (marks >= 70 && marks <= 73) {
    grade = 'C-';
  } else if (marks >= 74 && marks <= 76) {
    grade = 'C';
  } else if (marks >= 77 && marks <= 79) {
    grade = 'C+';
  } else if (marks >= 80 && marks <= 83) {
    grade = 'B-';
  } else if (marks >= 84 && marks <= 86) {
    grade = 'B';
  } else if (marks >= 87 && marks <= 89) {
    grade = 'B+';
  } else if (marks >= 90 && marks <= 93) {
    grade = 'A-';
  } else if (marks >= 94 && marks <= 96) {
    grade = 'A';
  } else if (marks >= 97 && marks <= 100) {
    grade = 'A+';
  }
  return grade;
};

export const StudentEnrolledCourseMarkUtils = {
  calculateGrade,
};
