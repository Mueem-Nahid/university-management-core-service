export type ISemesterRegistrationFilterRequest = {
  searchTerm?: string | undefined;
  academicSemesterId?: string | undefined;
};

export type IEnrolledCoursePayload = {
  offeredCourseId: string;
  offeredCourseSectionId: string;
};
