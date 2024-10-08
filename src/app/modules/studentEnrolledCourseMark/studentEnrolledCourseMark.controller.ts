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

const updateStudentTermMarks = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await StudentEnrolledCourseMarkService.updateStudentTermMarks(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Student marks updated successfully',
      data: result,
    });
  }
);

const updateStudentFinalMarks = catchAsync(
  async (req: Request, res: Response) => {
    const result = await StudentEnrolledCourseMarkService.updateFinalMark(
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Student final marks updated successfully',
      data: result,
    });
  }
);

export const StudentEnrolledCourseMarkController = {
  getAllFromDB,
  updateStudentTermMarks,
  updateStudentFinalMarks,
};
