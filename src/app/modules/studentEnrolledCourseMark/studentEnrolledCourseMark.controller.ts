import catchAsync from "../../../shared/catchAsync";
import {Request, Response} from "express";
import {StudentEnrolledCourseMarkService} from "./studentEnrolledCourseMark.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const updateStudentMarks = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentEnrolledCourseMarkService.updateStudentMarks(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student marks updated successfully',
    data: result
  });
});

export const StudentEnrolledCourseMarkController = {
  updateStudentMarks,
}