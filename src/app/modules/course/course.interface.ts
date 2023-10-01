export type ICourseCreateData = {
  title: string;
  code: string;
  credits: number;
  prerequisiteCourses: {
    courseId: string;
    shouldDelete?: boolean;
  }[];
};

export type ICourseFilterRequest = {
  searchTerm?: string | undefined;
};
