import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import { OfferedCourseService } from "./offeredCourse.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const createOfferedCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseService.createOfferedCourse(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Offered course created.",
    data: result
  })
});

const getAllOfferedCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseService.getAllOfferedCourse();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Offered courses.",
    data: result
  })
});

export const OfferedCourseController = {
  createOfferedCourse,
  getAllOfferedCourse
}