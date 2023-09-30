import prisma from '../../../shared/prisma';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { ICourseCreateData } from './course.interface';

const createCourse = async (data: ICourseCreateData): Promise<any> => {
  const { prerequisiteCourses, ...courseData } = data;

  const newCourse = await prisma.$transaction(async transactionClient => {
    const result = await transactionClient.course.create({
      data: courseData,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to create course.');

    if (prerequisiteCourses && prerequisiteCourses.length > 0) {
      // Extract the prerequisite courses' data
      const prerequisiteCourseData = prerequisiteCourses.map(
        (prerequisite: { courseId: string }) => ({
          courseId: result.id,
          prerequisiteId: prerequisite.courseId,
        })
      );

      // Create the prerequisite courses in bulk
      await transactionClient.courseToPrerequisite.createMany({
        data: prerequisiteCourseData,
      });
    }

    return result;
  });

  if (newCourse) {
    const responseData = await prisma.course.findUnique({
      where: {
        id: newCourse.id,
      },
      include: {
        prerequisite: {
          include: {
            prerequisite: true,
          },
        },
        prerequisiteFor: {
          include: {
            course: true,
          },
        },
      },
    });
    return responseData;
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to create course.');
};

export const CourseService = {
  createCourse,
};
