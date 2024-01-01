import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import { OfferedCourseClassScheduleService } from "./offeredCourseClassSchedule.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const createClassSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseClassScheduleService.createClassSchedule(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Offered course class schedule created.",
    data: result
  });
});

export const OfferedCourseClassScheduleController = {
  createClassSchedule,
}