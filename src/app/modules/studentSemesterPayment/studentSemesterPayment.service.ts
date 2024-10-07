import {ICreateStudentPaymentPayload, IStudentSemesterPaymentFilterRequest} from "./studentSemesterPayment.interface";
import {Prisma, PrismaClient, StudentSemesterPayment} from "@prisma/client";
import {ITXClientDenyList} from "@prisma/client/runtime/library";
import {IPaginationOptions} from "../../../interfaces/pagination";
import {IGenericResponse} from "../../../interfaces/common";
import {paginationHelpers} from "../../../helpers/paginationHelper";
import {
  studentSemesterPaymentRelationalFields,
  studentSemesterPaymentRelationalFieldsMapper,
  studentSemesterPaymentSearchableFields
} from "./studentSemesterPayment.constants";
import prisma from "../../../shared/prisma";

const createSemesterPayment = async (
  prismaTransaction: Omit<PrismaClient, ITXClientDenyList>,
  payload: ICreateStudentPaymentPayload
) => {
  const isExist = await prismaTransaction.studentSemesterPayment.findFirst({
    where: {
      student: {
        id: payload.studentId,
      },
      academicSemester: {
        id: payload.academicSemesterId,
      }
    }
  })

  if (!isExist) {
    const dataToInsert = {
      studentId: payload.studentId,
      academicSemesterId: payload.academicSemesterId,
      fullPaymentAmount: payload.totalPaymentAmount,
      partialPaymentAmount: payload.totalPaymentAmount * 0.5,
      totalDueAmount: payload.totalPaymentAmount,
      totalPaidAmount: 0
    };

    await prismaTransaction.studentSemesterPayment.create({
      data: dataToInsert,
    });
  }
};

const getAllFromDB = async (
  filters: IStudentSemesterPaymentFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<StudentSemesterPayment[]>> => {
  const {limit, page, skip} = paginationHelpers.calculatePagination(options);
  const {searchTerm, ...filterData} = filters;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: studentSemesterPaymentSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }))
    });
  }
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        if (studentSemesterPaymentRelationalFields.includes(key)) {
          return {
            [studentSemesterPaymentRelationalFieldsMapper[key]]: {
              id: (filterData as any)[key]
            }
          };
        } else {
          return {
            [key]: {
              equals: (filterData as any)[key]
            }
          };
        }
      })
    });
  }
  const whereConditions: Prisma.StudentSemesterPaymentWhereInput =
    andConditions.length > 0 ? {AND: andConditions} : {};
  const result = await prisma.studentSemesterPayment.findMany({
    include: {
      academicSemester: true,
      student: true
    },
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {[options.sortBy]: options.sortOrder}
        : {
          createdAt: 'desc'
        }
  });
  const total = await prisma.studentSemesterPayment.count({
    where: whereConditions
  });
  return {
    meta: {
      total,
      page,
      limit
    },
    data: result
  };
};

export const StudentSemesterPaymentService = {
  createSemesterPayment,
  getAllFromDB,
}