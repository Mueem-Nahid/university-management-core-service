import { OfferedCourseClassSchedule } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { OfferedCourseClassScheduleUtils } from './offeredCourseClassSchedule.utils';

const createClassSchedule = async (data: OfferedCourseClassSchedule): Promise<OfferedCourseClassSchedule> => {
  await OfferedCourseClassScheduleUtils.checkRoomAvailability(data);

  return prisma.offeredCourseClassSchedule.create({
    data,
    include: {
      semesterRegistration: true,
      offeredCourseSection: true,
      room: true,
      faculty: true
    }
  });
};

export const OfferedCourseClassScheduleService = {
  createClassSchedule
};