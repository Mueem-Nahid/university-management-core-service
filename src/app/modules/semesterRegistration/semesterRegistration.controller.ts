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
  const { id } = req.params;
  const result = await SemesterRegistrationService.getByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ok',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SemesterRegistrationService.deleteByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    success: true,
    data: result,
  });
});

const updateOneSemester = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SemesterRegistrationService.updateOneInDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester registration updated successfully.',
    data: result,
  });
});

const startMyRegistration = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await SemesterRegistrationService.startMyRegistration(user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester registration started successfully.',
    data: result,
  });
});

const enrollIntoCourse = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await SemesterRegistrationService.enrollIntoCourse(
    user?.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Enrolled successfully.',
    data: result,
  });
});

const withdrawFromCourse = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await SemesterRegistrationService.withdrawFromCourse(
    user?.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Withdraw successfully.',
    data: result,
  });
});

const confirmMyRegistration = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await SemesterRegistrationService.confirmMyRegistration(
    user?.id
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Registration confirmed.',
    data: result,
  });
});

const getMyRegistration = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await SemesterRegistrationService.getMyRegistration(
    user?.id
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Registration information.',
    data: result,
  });
});

const startNewSemester = catchAsync(async (req: Request, res: Response) => {
  const {id} = req.params;
  const result = await SemesterRegistrationService.startNewSemester(
    id
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester started successfully.',
    data: result,
  });
});

export const SemesterRegistrationController = {
  createSemesterRegistration,
  getAllSemester,
  getSingleSemester,
  deleteByIdFromDB,
  updateOneSemester,
  startMyRegistration,
  enrollIntoCourse,
  withdrawFromCourse,
  confirmMyRegistration,
  getMyRegistration,
  startNewSemester,
};
