export type ICourseCreateData = {
  title: string;
  code: string;
  credits: number;
  prerequisiteCourses: {
    courseId: string;
  }[];
};

export type ICourseFilterRequest = {
  searchTerm?: string | undefined;
};
