import { Request, Response } from 'express';

import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';

import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { StudentService } from './student.service';
import { studentFilterableFields } from './student.constant';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { Student } from '@prisma/client';

const createStudent = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.createStudent(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student created successfully',
    data: result,
  });
});

const getAllStudent = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const filters = pick(req.query, studentFilterableFields);
    const paginationOptions: IPaginationOptions = pick(
      req.query,
      paginationFields
    );

    const result = await StudentService.getAllStudents(
      filters,
      paginationOptions
    );

    sendResponse<Student[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Students retrieved successfully !',
      meta: result.meta,
      data: result.data,
    });
  }
);

const getSingleStudent = catchAsync(async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const result = await StudentService.getSingleStudent(id);
  sendResponse<Student>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ok',
    data: result,
  });
});

const updateStudent = catchAsync(async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const data = req.body;
  const result = await StudentService.updateStudent(id, data);
  sendResponse<Student>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student updated !',
    data: result,
  });
});

const deleteStudent = catchAsync(async (req: Request, res: Response) => {
  const id: string = req.params.id;
  await StudentService.deleteStudent(id);
  sendResponse<Student>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student deleted !',
  });
});

export const StudentController = {
  createStudent,
  getAllStudent,
  getSingleStudent,
  updateStudent,
  deleteStudent,
};
