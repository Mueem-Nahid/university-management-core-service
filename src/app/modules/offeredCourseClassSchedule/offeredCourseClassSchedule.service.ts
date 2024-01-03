import { OfferedCourseClassSchedule } from "@prisma/client";
import ApiError from "../../../errors/ApiError";
import prisma from "../../../shared/prisma";
import { hasTimeConflict } from "../../../shared/utils";

const createClassSchedule = async (data: OfferedCourseClassSchedule): Promise<OfferedCourseClassSchedule> => {
  const alreadyBookedRoom = await prisma.offeredCourseClassSchedule.findMany({
    where: {
      dayOfWeek: data.dayOfWeek,
      room: {
        id: data.roomId
      }
    },
    select: {
      startTime: true,
      endTime: true,
      dayOfWeek: true
    }
  });

  const newSlot = {
    startTime: data.startTime,
    endTime: data.endTime,
    dayOfWeek: data.dayOfWeek
  }

  if(hasTimeConflict(alreadyBookedRoom, newSlot)) {
    throw new ApiError(httpStatus.CONFLICT, "Room is already booked.");
  }

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