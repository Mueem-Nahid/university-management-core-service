import { z } from 'zod';

const create = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
    }),
    code: z.string({
      required_error: 'Code is required',
    }),
    credits: z.number({
      required_error: 'Credits is required',
    }),
    preRequisiteCourses: z
      .array(
        z.object({
          courseId: z.string({}),
        })
      )
      .optional(),
  }),
});

const update = z.object({
  body: z.object({
    title: z.string().optional(),
    code: z.string().optional(),
    credits: z.number().optional(),
    prerequisiteCourses: z
      .array(
        z.object({
          courseId: z.string({}),
          shouldDelete: z.boolean({}).optional(),
        })
      )
      .optional(),
  }),
});

export const CourseValidation = {
  create,
  update,
};
