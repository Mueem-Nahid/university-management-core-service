import prisma from '../../../shared/prisma';
import { OfferedCourseClassSchedule } from '@prisma/client';
import { hasTimeConflict } from '../../../shared/utils';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

const checkRoomAvailability = async (data: OfferedCourseClassSchedule) => {
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
  };

  if (hasTimeConflict(alreadyBookedRoom, newSlot)) {
    throw new ApiError(httpStatus.CONFLICT, 'Room is already booked.');
  }
};

const checkFacultyAvailability = async (data: OfferedCourseClassSchedule) => {
  const isFacusltyAlreadyAssigned = await prisma.offeredCourseClassSchedule.findMany({
    where: {
      dayOfWeek: data.dayOfWeek,
      faculty: {
        id: data.facultyId
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
  };

  if (hasTimeConflict(isFacusltyAlreadyAssigned, newSlot)) {
    throw new ApiError(httpStatus.CONFLICT, 'Faculty is already assigned.');
  }
}

export const OfferedCourseClassScheduleUtils = {
  checkRoomAvailability,
  checkFacultyAvailability
};