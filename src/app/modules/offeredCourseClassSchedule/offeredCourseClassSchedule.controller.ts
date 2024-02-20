import catchAsync from '../../../shared/catchAsync';
import { Request, Response } from 'express';
import { OfferedCourseClassScheduleService } from './offeredCourseClassSchedule.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { offeredCourseClassScheduleFilterablelFields } from './offeredCourseClassSchedule.constants';

const createClassSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseClassScheduleService.createClassSchedule(
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Offered course class schedule created.',
    data: result,
  });
});

const getAllOfferedCourseClassSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(
      req.query,
      offeredCourseClassScheduleFilterablelFields
    );
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result =
      await OfferedCourseClassScheduleService.getAllOfferedCourseSchedule(
        filters,
        options
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Offered course class schedules.',
      meta: result.meta,
      data: result,
    });
  }
);

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await OfferedCourseClassScheduleService.getByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OfferedCourseClassSchedule fetched successfully',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await OfferedCourseClassScheduleService.updateOneInDB(
    id,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OfferedCourseClassSchedule updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await OfferedCourseClassScheduleService.deleteByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OfferedCourseClassSchedule deleted successfully',
    data: result,
  });
});

export const OfferedCourseClassScheduleController = {
  createClassSchedule,
  getAllOfferedCourseClassSchedule,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
