export type IMonth =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

export type IAcademicSemesterTitle = 'Spring' | 'Summer' | 'Fall';

export type IAcademicSemesterCode = '01' | '02' | '03';

export type IAcademicSemester = {
  title: IAcademicSemesterTitle;
  year: string;
  code: IAcademicSemesterCode;
  startMonth: IMonth;
  endMonth: IMonth;
};

export type IAcademicSemesterFilter = {
  searchTerm?: string;
};
