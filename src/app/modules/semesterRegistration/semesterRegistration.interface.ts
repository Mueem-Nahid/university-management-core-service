import {Course, OfferedCourse, StudentSemesterRegistrationCourse} from "@prisma/client";

export type ISemesterRegistrationFilterRequest = {
  searchTerm?: string | undefined;
  academicSemesterId?: string | undefined;
};

export type IEnrolledCoursePayload = {
  offeredCourseId: string;
  offeredCourseSectionId: string;
};

export type StudentCoursesMap = {
  [key: string]: (StudentSemesterRegistrationCourse & {
    offeredCourse: OfferedCourse & {
      course: Course;
    };
  })[];
};
