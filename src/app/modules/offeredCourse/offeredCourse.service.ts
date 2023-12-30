import { ICreateOfferedCourse } from "./offeredCourse.interface";
import { OfferedCourse } from "@prisma/client";
import prisma from "../../../shared/prisma";

const createOfferedCourse = async (data: ICreateOfferedCourse): Promise<OfferedCourse[]> => {
  const {academicDepartmentId, semesterRegistrationId, courseIds} = data;
  const offeredCoursesData = courseIds.map((courseId) => ({
    academicDepartmentId,
    semesterRegistrationId,
    courseId,
  }));

  // bulk insert
  await prisma.offeredCourse.createMany({
    data: offeredCoursesData,
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
  });

  return createdCourses;
}

export const OfferedCourseService = {
  createOfferedCourse
}