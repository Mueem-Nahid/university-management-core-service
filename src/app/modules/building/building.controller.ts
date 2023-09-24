import catchAsync from "../../../shared/catchAsync";
import {Request, Response} from "express";
import {BuildingService} from "./building.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const createBuilding = catchAsync(async (req: Request, res: Response) => {
   const result = await BuildingService.createBuilding(req.body);
   sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Building created.",
      data: result
   })
});

const getAllBuilding = catchAsync(async (req: Request, res: Response) => {
   const result = await BuildingService.getAllBuilding();
   sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All building.",
      data: result
   })
});

export const BuildingController = {
   createBuilding,
   getAllBuilding
}