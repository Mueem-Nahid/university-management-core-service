import { ICreateOfferedCourse } from "./offeredCourse.interface";
import { OfferedCourse } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";

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

export const OfferedCourseService = {
  createOfferedCourse
}