import { z } from 'zod';

const createOfferedCourse = z.object({
  body: z.object({
    academicDepartmentId: z.string({
      required_error: 'Academic department id is required.',
    }),
    semesterRegistrationId: z.string({
      required_error: 'Semester registration id is required.',
    }),
    courseIds: z.array(
      z.string({
        required_error: 'Course id is required.',
      }),
      {
        required_error: 'Course Ids are required.',
      }
    ),
  }),
});

const updateOfferedCourse = z.object({
  body: z.object({
    semesterRegistrationId: z.string().optional(),
    courseId: z.string().optional(),
    academicDepartmentId: z.string().optional(),
  }),
});

export const OfferedCourseValidation = {
  createOfferedCourse,
  updateOfferedCourse,
};
