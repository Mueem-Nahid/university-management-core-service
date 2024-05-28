import {Prisma, SemesterRegistration, SemesterRegistrationStatus, StudentSemesterRegistration,} from '@prisma/client';
import prisma from '../../../shared/prisma';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import {IEnrolledCoursePayload, ISemesterRegistrationFilterRequest,} from './semesterRegistration.interface';
import {IPaginationOptions} from '../../../interfaces/pagination';
import {IGenericResponse} from '../../../interfaces/common';
import {paginationHelpers} from '../../../helpers/paginationHelper';
import {
  semesterRegistrationRelationalFields,
  semesterRegistrationRelationalFieldsMapper,
  semesterRegistrationSearchableFields,
} from './semesterRegistration.constants';

const createSemesterRegistration = async (
  data: SemesterRegistration
): Promise<SemesterRegistration> => {
  const isAnySemesterRegUpcomingOrOngoing =
    await prisma.semesterRegistration.findFirst({
      where: {
        OR: [
          {
            status: SemesterRegistrationStatus.UPCOMING,
          },
          {
            status: SemesterRegistrationStatus.ONGOING,
          },
        ],
      },
    });

  if (isAnySemesterRegUpcomingOrOngoing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `There is already an ${isAnySemesterRegUpcomingOrOngoing.status} registration.`
    );
  }

  const result = await prisma.semesterRegistration.create({
    data,
  });

  return result;
};

const getAllFromDB = async (
  filters: ISemesterRegistrationFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<SemesterRegistration[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: semesterRegistrationSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => {
        if (semesterRegistrationRelationalFields.includes(key)) {
          return {
            [semesterRegistrationRelationalFieldsMapper[key]]: {
              id: (filterData as any)[key],
            },
          };
        } else {
          return {
            [key]: {
              equals: (filterData as any)[key],
            },
          };
        }
      }),
    });
  }

  const whereConditions: Prisma.SemesterRegistrationWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.semesterRegistration.findMany({
    include: {
      academicSemester: true,
    },
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });
  const total = await prisma.semesterRegistration.count({
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

const getByIdFromDB = async (
  id: string
): Promise<SemesterRegistration | null> => {
  const result = await prisma.semesterRegistration.findUnique({
    where: {
      id,
    },
    include: {
      academicSemester: true,
    },
  });
  return result;
};

const updateOneInDB = async (
  id: string,
  payload: Partial<SemesterRegistration>
): Promise<SemesterRegistration> => {
  const isExist = await prisma.semesterRegistration.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data not found.');
  }

  // status can be only updated in this manner: UPCOMING > ONGOING > ENDED
  if (
    payload?.status &&
    isExist.status === SemesterRegistrationStatus.UPCOMING &&
    payload?.status !== SemesterRegistrationStatus.ONGOING
  )
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Status can be moved from upcoming to ongoing.'
    );

  if (
    payload?.status &&
    isExist.status === SemesterRegistrationStatus.ONGOING &&
    payload?.status !== SemesterRegistrationStatus.ENDED
  )
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Status can be moved from ongoing to ended.'
    );

  const result = await prisma.semesterRegistration.update({
    where: {
      id,
    },
    data: payload,
    include: {
      academicSemester: true,
    },
  });
  return result;
};

const deleteByIdFromDB = async (id: string): Promise<SemesterRegistration> => {
  const result = await prisma.semesterRegistration.delete({
    where: {
      id,
    },
    include: {
      academicSemester: true,
    },
  });
  return result;
};

const startMyRegistration = async (
  authUserId: string
): Promise<{
  semesterRegistration: SemesterRegistration | null;
  studentSemesterRegistration: StudentSemesterRegistration | null;
}> => {
  const studentInfo = await prisma.student.findFirst({
    where: {
      studentId: authUserId,
    },
  });
  if (!studentInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found.');
  }
  const semesterRegInfo = await prisma.semesterRegistration.findFirst({
    where: {
      status: {
        in: [
          SemesterRegistrationStatus.ONGOING,
          SemesterRegistrationStatus.UPCOMING,
        ],
      },
    },
  });

  if (semesterRegInfo?.status === SemesterRegistrationStatus.UPCOMING) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Registration is not started yet.'
    );
  }

  let studentSemesterRegistration =
    await prisma.studentSemesterRegistration.findFirst({
      where: {
        student: {
          id: studentInfo?.id,
        },
        semesterRegistration: {
          id: semesterRegInfo?.id,
        },
      },
    });

  if (!studentSemesterRegistration) {
    studentSemesterRegistration =
      await prisma.studentSemesterRegistration.create({
        data: {
          student: {
            connect: {
              id: studentInfo?.id,
            },
          },
          semesterRegistration: {
            connect: {
              id: semesterRegInfo?.id,
            },
          },
        },
      });
  }

  return {
    semesterRegistration: semesterRegInfo,
    studentSemesterRegistration,
  };
};

const enrollIntoCourse = async (
  authUserId: string,
  payload: IEnrolledCoursePayload
) => {
  const student = await prisma.student.findFirst({
    where: {
      studentId: authUserId,
    },
  });

  if (!student)
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found.');

  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING,
    },
  });

  if (!semesterRegistration)
    throw new ApiError(httpStatus.NOT_FOUND, 'There is no ongoing semester.');

  const offeredCourse = await prisma.offeredCourse.findFirst({
    where: {
      id: payload?.offeredCourseId
    },
    include: {
      course: {
        select: {
          credits: true,
        }
      }
    }
  });

  if (!offeredCourse)
    throw new ApiError(httpStatus.NOT_FOUND, 'Offered course was not found.');

  const offeredCourseSection = await prisma.offeredCourseSection.findFirst({
    where: {
      id: payload?.offeredCourseSectionId
    }
  });

  if (!offeredCourseSection)
    throw new ApiError(httpStatus.NOT_FOUND, 'Offered course section was not found.');

  await prisma.$transaction(async(transaction) => {
    // create
    await transaction.studentSemesterRegistrationCourse.create({
      data: {
        studentId: student?.id,
        semesterRegistrationId: semesterRegistration?.id,
        offeredCourseId: payload.offeredCourseId,
        offeredCourseSectionId: payload.offeredCourseSectionId,
      },
    });

    if(
      offeredCourseSection?.maxCapacity &&
      offeredCourseSection?.currentlyEnrolledStudent &&
      offeredCourseSection?.currentlyEnrolledStudent >= offeredCourseSection.maxCapacity
    ) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Maximum capacity exceeded.');
    }

    // update current enrolled student count
    await transaction.offeredCourseSection.update({
      where: {
        id: payload?.offeredCourseSectionId,
      },
      data: {
        currentlyEnrolledStudent: {
          increment: 1
        }
      }
    });

    await transaction.studentSemesterRegistration.updateMany({
      where: {
        student: {
          id: student?.id,
        },
        semesterRegistration: {
          id: semesterRegistration.id
        },
      },
      data: {
        totalCreditsTaken: {
          increment: offeredCourse.course.credits
        }
      }
    })
  });

  return {
    message: "Successfully enrolled into course.",
  }
};

const withdrawFromCourse = async (
  authUserId: string,
  payload: IEnrolledCoursePayload
) => {
  const student = await prisma.student.findFirst({
    where: {
      studentId: authUserId,
    },
  });

  if (!student)
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found.');

  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING,
    },
  });

  if (!semesterRegistration)
    throw new ApiError(httpStatus.NOT_FOUND, 'There is no ongoing semester.');

  const offeredCourse = await prisma.offeredCourse.findFirst({
    where: {
      id: payload?.offeredCourseId
    },
    include: {
      course: {
        select: {
          credits: true,
        }
      }
    }
  });

  if (!offeredCourse)
    throw new ApiError(httpStatus.NOT_FOUND, 'Offered course was not found.');

  await prisma.$transaction(async(transaction) => {
    // deleting row where composite key is the primary key
    await transaction.studentSemesterRegistrationCourse.delete({
      where: {
        semesterRegistrationId_studentId_offeredCourseId: {
          semesterRegistrationId: semesterRegistration?.id,
          studentId: student?.id,
          offeredCourseId: payload.offeredCourseId,
        }
      }
    });

    // update current enrolled student count
    await transaction.offeredCourseSection.update({
      where: {
        id: payload?.offeredCourseSectionId,
      },
      data: {
        currentlyEnrolledStudent: {
          decrement: 1
        }
      }
    });

    await transaction.studentSemesterRegistration.updateMany({
      where: {
        student: {
          id: student?.id,
        },
        semesterRegistration: {
          id: semesterRegistration.id
        },
      },
      data: {
        totalCreditsTaken: {
          decrement: offeredCourse.course.credits
        }
      }
    })
  });

  return {
    message: "Successfully withdraw from course.",
  }
};

export const SemesterRegistrationService = {
  createSemesterRegistration,
  getByIdFromDB,
  getAllFromDB,
  deleteByIdFromDB,
  updateOneInDB,
  startMyRegistration,
  enrollIntoCourse,
  withdrawFromCourse
};
