const calculateGrade = (marks: number) => {
  let grade = '';
  let point = 0.0;
  if (marks >= 0 && marks <= 59) {
    grade = 'F';
    point = 0.0;
  } else if (marks >= 60 && marks <= 69) {
    grade = 'D';
    point = 1.7;
  } else if (marks >= 70 && marks <= 73) {
    grade = 'C-';
    point = 2.0;
  } else if (marks >= 74 && marks <= 76) {
    grade = 'C';
    point = 2.3;
  } else if (marks >= 77 && marks <= 79) {
    grade = 'C+';
    point = 2.5;
  } else if (marks >= 80 && marks <= 83) {
    grade = 'B-';
    point = 2.7;
  } else if (marks >= 84 && marks <= 86) {
    grade = 'B';
    point = 3.0;
  } else if (marks >= 87 && marks <= 89) {
    grade = 'B+';
    point = 3.3;
  } else if (marks >= 90 && marks <= 93) {
    grade = 'A-';
    point = 3.5;
  } else if (marks >= 94 && marks <= 96) {
    grade = 'A';
    point = 3.7;
  } else if (marks >= 97 && marks <= 100) {
    grade = 'A+';
    point = 4.0;
  }
  return { grade, point };
};

const calculateFinalMark = (midTermMark: number, finalTermMark: number) => {
  return Math.ceil(midTermMark * 0.4) + Math.ceil(finalTermMark * 0.6);
};

export const StudentEnrolledCourseMarkUtils = {
  calculateGrade,
  calculateFinalMark,
};
