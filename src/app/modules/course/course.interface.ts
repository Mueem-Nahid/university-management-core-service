export type ICourseCreateData = {
  title: string;
  code: string;
  credits: number;
  prerequisiteCourses: {
    courseId: string;
  }[];
};
