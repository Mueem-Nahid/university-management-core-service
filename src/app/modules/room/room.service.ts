import { Room } from '@prisma/client';
import prisma from '../../../shared/prisma';

const createRoom = async (data: Room): Promise<Room> => {
  const result = await prisma.room.create({
    data,
    include: {
      building: true,
    },
  });
  return result;
};

export const RoomService = {
  createRoom,
};
