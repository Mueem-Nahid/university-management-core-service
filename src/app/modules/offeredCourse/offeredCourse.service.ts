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

  const offeredCourses = await prisma.offeredCourse.createMany({
    data: offeredCoursesData,
  });

  return offeredCourses;
}

export const OfferedCourseService = {
  createOfferedCourse
}