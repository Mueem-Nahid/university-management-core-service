import catchAsync from '../../../shared/catchAsync';
import { Request, Response } from 'express';
import { StudentEnrolledCourseMarkService } from './studentEnrolledCourseMark.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { studentEnrolledCourseMarkFilterableFields } from './studentEnrolledCourseMark.constants';
import pick from '../../../shared/pick';

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, studentEnrolledCourseMarkFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await StudentEnrolledCourseMarkService.getAllFromDB(
    filters,
    options
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student course marks fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateStudentMarks = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentEnrolledCourseMarkService.updateStudentMarks(
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student marks updated successfully',
    data: result,
  });
});

export const StudentEnrolledCourseMarkController = {
  getAllFromDB,
  updateStudentMarks,
};
