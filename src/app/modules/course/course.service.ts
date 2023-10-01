import prisma from '../../../shared/prisma';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { ICourseCreateData, ICourseFilterRequest } from './course.interface';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { Course, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { courseSearchableFields } from './course.constants';

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

const getAllFromDB = async (
  filters: ICourseFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Course[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: courseSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.CourseWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.course.findMany({
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
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });
  const total = await prisma.course.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getByIdFromDB = async (id: string): Promise<Course | null> => {
  const result = await prisma.course.findUnique({
    where: {
      id,
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
  return result;
};

const deleteByIdFromDB = async (id: string): Promise<Course> => {
  await prisma.courseToPrerequisite.deleteMany({
    where: {
      OR: [
        {
          courseId: id,
        },
        {
          prerequisiteId: id,
        },
      ],
    },
  });

  const result = await prisma.course.delete({
    where: {
      id,
    },
  });
  return result;
};

export const CourseService = {
  createCourse,
  getAllFromDB,
  getByIdFromDB,
  deleteByIdFromDB,
};
