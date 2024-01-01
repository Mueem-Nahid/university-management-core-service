import { ICreateOfferedCourse, IOfferedCourseFilterRequest } from "./offeredCourse.interface";
import { OfferedCourse, Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { paginationHelpers } from "../../../helpers/paginationHelper";
import {
  offeredCourseRelationalFields,
  offeredCourseRelationalFieldsMapper,
  offeredCourseSearchableFields
} from "./offeredCourse.constant";
import { IGenericResponse } from "../../../interfaces/common";

const createOfferedCourse = async (data: ICreateOfferedCourse): Promise<OfferedCourse[]> => {
  const {academicDepartmentId, semesterRegistrationId, courseIds} = data;
  const offeredCoursesData = courseIds.map((courseId) => ({
    academicDepartmentId,
    semesterRegistrationId,
    courseId,
  }));

  // Check for existing courses
  const existingCourses = await prisma.offeredCourse.findMany({
    where: {
      academicDepartmentId,
      semesterRegistrationId,
      courseId: {
        in: courseIds,
      },
    },
  });

  // Extract the existing course IDs
  const existingCourseIds = new Set(existingCourses.map((course) => course.courseId));

  // Filter out courses that already exist
  const newCoursesData = offeredCoursesData.filter((courseData) => !existingCourseIds.has(courseData.courseId));

  if (!newCoursesData?.length)
    throw new ApiError(httpStatus.BAD_REQUEST, "Course already exist.")

  // bulk insert
  await prisma.offeredCourse.createMany({
    data: newCoursesData,
  });

  // Fetch the created courses
  const createdCourses = await prisma.offeredCourse.findMany({
    where: {
      academicDepartmentId,
      semesterRegistrationId,
      courseId: {
        in: courseIds,
      },
    },
    include: {
      academicDepartment: true,
      semesterRegistration: true,
      course: true
    }
  });

  return createdCourses;
}

const getAllOfferedCourse = async (filters: IOfferedCourseFilterRequest, options: IPaginationOptions):
  Promise<IGenericResponse<OfferedCourse[]>> => {
  const {limit, page, skip} = paginationHelpers.calculatePagination(options);
  const {searchTerm, ...filterData} = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: offeredCourseSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }))
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        if (offeredCourseRelationalFields.includes(key)) {
          return {
            [offeredCourseRelationalFieldsMapper[key]]: {
              id: (filterData as any)[key]
            }
          };
        } else {
          return {
            [key]: {
              equals: (filterData as any)[key]
            }
          };
        }
      })
    });
  }

  const whereConditions: Prisma.OfferedCourseWhereInput =
    andConditions.length > 0 ? {AND: andConditions} : {};

  const result = await prisma.offeredCourse.findMany({
    include: {
      semesterRegistration: true,
      course: true,
      academicDepartment: true
    },
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {[options.sortBy]: options.sortOrder}
        : {
          createdAt: 'desc'
        }
  });
  const total = await prisma.offeredCourse.count({
    where: whereConditions
  });

  return {
    meta: {
      total,
      page,
      limit
    },
    data: result
  };
};

const getByIdFromDB = async (id: string): Promise<OfferedCourse | null> => {
  const result = await prisma.offeredCourse.findUnique({
    where: {
      id
    },
    include: {
      semesterRegistration: true,
      course: true,
      academicDepartment: true
    }
  });
  return result;
};

const updateOneInDB = async (
  id: string,
  payload: Partial<OfferedCourse>
): Promise<OfferedCourse> => {
  const result = await prisma.offeredCourse.update({
    where: {
      id
    },
    data: payload,
    include: {
      semesterRegistration: true,
      course: true,
      academicDepartment: true
    }
  });
  return result;
};

const deleteByIdFromDB = async (id: string): Promise<OfferedCourse> => {
  const result = await prisma.offeredCourse.delete({
    where: {
      id
    },
    include: {
      semesterRegistration: true,
      course: true,
      academicDepartment: true
    }
  });
  return result;
};

export const OfferedCourseService = {
  createOfferedCourse,
  getAllOfferedCourse,
  deleteByIdFromDB,
  updateOneInDB,
  getByIdFromDB
}