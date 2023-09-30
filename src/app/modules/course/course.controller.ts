import catchAsync from '../../../shared/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { CourseService } from './course.service';

const createCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.createCourse(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Course created.',
    data: result,
  });
});

export const CourseController = {
  createCourse,
};
