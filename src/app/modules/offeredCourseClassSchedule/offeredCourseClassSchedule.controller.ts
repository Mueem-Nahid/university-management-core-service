import catchAsync from '../../../shared/catchAsync';
import { Request, Response } from 'express';
import { OfferedCourseClassScheduleService } from './offeredCourseClassSchedule.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { offeredCourseClassScheduleRelationalFields } from './offeredCourseClassSchedule.constants';

const createClassSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseClassScheduleService.createClassSchedule(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Offered course class schedule created.',
    data: result
  });
});

const getAllOfferedCourseClassSchedule = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, offeredCourseClassScheduleRelationalFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await OfferedCourseClassScheduleService.getAllOfferedCourseSchedule(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered course class schedules.',
    data: result
  });
});

export const OfferedCourseClassScheduleController = {
  createClassSchedule,
  getAllOfferedCourseClassSchedule
};