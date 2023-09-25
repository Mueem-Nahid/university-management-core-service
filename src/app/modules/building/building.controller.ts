import catchAsync from '../../../shared/catchAsync';
import { Request, Response } from 'express';
import { BuildingService } from './building.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { buildingFilterableFields } from './building.constants';
import { paginationFields } from '../../../constants/pagination';

const createBuilding = catchAsync(async (req: Request, res: Response) => {
  const result = await BuildingService.createBuilding(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Building created.',
    data: result,
  });
});

const getAllBuilding = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, buildingFilterableFields);
  const options = pick(req.query, paginationFields);

  const result = await BuildingService.getAllBuilding(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All building.',
    meta: result.meta,
    data: result.data,
  });
});

export const BuildingController = {
  createBuilding,
  getAllBuilding,
};
