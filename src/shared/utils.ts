import { WeekDays } from '@prisma/client';

export const asyncForEach = async (array: any[], callback: any) => {
  if (!Array.isArray(array)) {
    throw new Error('Expected array.');
  }
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const hasTimeConflict = (
  alreadyBookedRoom: {
    startTime: string;
    endTime: string;
    dayOfWeek: WeekDays;
  }[],
  newSlot: { startTime: string; endTime: string; dayOfWeek: WeekDays }
) => {
  for (const slot of alreadyBookedRoom) {
    const formattedExistingStartTime = new Date(
      `1970-01-01T${slot.startTime}:00`
    );
    const formattedExistingEndTime = new Date(
      `1970-01-01T${slot.startTime}:00`
    );
    const formattedNewStartTime = new Date(
      `1970-01-01T${newSlot.startTime}:00`
    );
    const formattedNewEndTime = new Date(`1970-01-01T${newSlot.startTime}:00`);

    if (
      formattedNewStartTime < formattedExistingEndTime &&
      formattedNewEndTime > formattedExistingStartTime
    ) {
      return true;
    }

    return false;
  }
};
