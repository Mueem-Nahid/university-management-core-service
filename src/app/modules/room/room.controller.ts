import catchAsync from '../../../shared/catchAsync';
import { Request, Response } from 'express';
import { RoomService } from './room.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';

const createRoom = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.createRoom(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Room created.',
    data: result,
  });
});

export const RoomController = {
  createRoom,
};
