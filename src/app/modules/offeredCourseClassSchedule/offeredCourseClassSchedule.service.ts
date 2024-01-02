import { OfferedCourseClassSchedule } from "@prisma/client";
import prisma from "../../../shared/prisma";

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

  for (const slot of alreadyBookedRoom) {
    const formattedExistingStartTime = new Date(`1970-01-01${slot.startTime}:00`);
    const formattedExistingEndTime = new Date(`1970-01-01${slot.startTime}:00`);
    const formattedNewStartTime = new Date(`1970-01-01${newSlot.startTime}:00`);
    const formattedNewEndTime = new Date(`1970-01-01${newSlot.startTime}:00`);
  }

  console.log(alreadyBookedRoom)

  // const result = await prisma.offeredCourseClassSchedule.create({
  //   data,
  //   include: {
  //     semesterRegistration: true,
  //     offeredCourseSection: true,
  //     room: true,
  //     faculty: true
  //   }
  // });
  // return result;
}

export const OfferedCourseClassScheduleService = {
  createClassSchedule,
}