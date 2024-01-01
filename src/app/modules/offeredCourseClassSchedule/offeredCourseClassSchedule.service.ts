import { OfferedCourseClassSchedule } from "@prisma/client";
import prisma from "../../../shared/prisma";

const createClassSchedule = async (data: OfferedCourseClassSchedule): Promise<OfferedCourseClassSchedule> => {
  const result = await prisma.offeredCourseClassSchedule.create({
    data,
    include: {
      semesterRegistration: true,
      offeredCourseSection: true,
      room: true,
      faculty: true
    }
  });
  return result;
}

export const OfferedCourseClassScheduleService = {
  createClassSchedule,
}