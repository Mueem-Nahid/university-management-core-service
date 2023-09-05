import { AcademicDepartment, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import {
  academicDepartmentRelationalFields,
  academicDepartmentRelationalFieldsMapper,
  academicDepartmentSearchableFields,
} from './academicDepartment.constants';
import { IAcademicDepartmentFilters } from './academicDepartment.interfaces';
import prisma from '../../../shared/prisma';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { IGenericResponse } from '../../../interfaces/common';

const getAllDepartments = async (
  filters: IAcademicDepartmentFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<AcademicDepartment[]>> => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const { searchTerm, ...filtersData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: academicDepartmentSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length > 0) {
    andConditions.push({
      AND: Object.keys(filtersData).map(key => {
        if (academicDepartmentRelationalFields.includes(key)) {
          return {
            [academicDepartmentRelationalFieldsMapper[key]]: {
              id: (filtersData as any)[key],
            },
          };
        } else {
          return {
            [key]: {
              equals: (filtersData as any)[key],
            },
          };
        }
      }),
    });
  }

  const whereConditions: Prisma.AcademicDepartmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.academicDepartment.findMany({
    include: {
      academicFaculty: true,
    },
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      paginationOptions.sortBy && paginationOptions.sortOrder
        ? { [paginationOptions.sortBy]: paginationOptions.sortOrder }
        : {
            createdAt: 'desc',
          },
  });
  const total = await prisma.academicDepartment.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const createDepartment = async (
  data: AcademicDepartment
): Promise<AcademicDepartment | null> => {
  const result = await prisma.academicDepartment.create({
    data,
    include: {
      academicFaculty: true,
    },
  });

  return result;
};

const getSingleDepartment = async (
  id: string
): Promise<AcademicDepartment | null> => {
  const result = await prisma.academicDepartment.findUnique({
    where: {
      id,
    },
    include: {
      academicFaculty: true,
    },
  });
  return result;
};

const updateDepartment = async (
  id: string,
  payload: Partial<AcademicDepartment>
): Promise<AcademicDepartment | null> => {
  return null;
};

const deleteDepartment = async (
  id: string
): Promise<AcademicDepartment | null> => {
  return null;
};

export const AcademicDepartmentService = {
  getAllDepartments,
  getSingleDepartment,
  updateDepartment,
  deleteDepartment,
  createDepartment,
};
