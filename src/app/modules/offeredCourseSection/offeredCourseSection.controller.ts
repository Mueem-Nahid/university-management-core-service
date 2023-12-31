import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import { OfferedCourseSectionService } from "./offeredCourseSection.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const createOfferedCourseSection = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseSectionService.createOfferedCourseSection(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Offered course section created.",
    data: result
  });
});

export const OfferedCourseSectionController = {
  createOfferedCourseSection
}