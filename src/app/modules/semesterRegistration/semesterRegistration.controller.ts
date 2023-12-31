import catchAsync from '../../../shared/catchAsync';
import { Request, Response } from 'express';
import { SemesterRegistrationService } from './semesterRegistration.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { semesterRegistrationFilterableFields } from './semesterRegistration.constants';

const createSemesterRegistration = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SemesterRegistrationService.createSemesterRegistration(
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Semester successfully registered.',
      data: result,
    });
  }
);

const getAllSemester = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, semesterRegistrationFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await SemesterRegistrationService.getAllFromDB(
    filters,
    options
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All semesters.',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleSemester = catchAsync(async (req: Request, res: Response) => {
  const {id} = req.params;
  const result = await SemesterRegistrationService.getByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ok',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const {id} = req.params;
  const result = await SemesterRegistrationService.deleteByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    success: true,
    data: result,
  });
});

const updateOneSemester = catchAsync(async (req: Request, res: Response) => {
  const {id} = req.params;
  const result = await SemesterRegistrationService.updateOneInDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester registration updated successfully.',
    data: result,
  });
});

export const SemesterRegistrationController = {
  createSemesterRegistration,
  getAllSemester,
  getSingleSemester,
  deleteByIdFromDB,
  updateOneSemester
};
