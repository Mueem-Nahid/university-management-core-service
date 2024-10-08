import {
  Prisma,
  SemesterRegistration,
  SemesterRegistrationStatus,
  StudentSemesterRegistration,
} from '@prisma/client';
import prisma from '../../../shared/prisma';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import {
  IEnrolledCoursePayload,
  ISemesterRegistrationFilterRequest,
  StudentCoursesMap,
} from './semesterRegistration.interface';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import {
  semesterRegistrationRelationalFields,
  semesterRegistrationRelationalFieldsMapper,
  semesterRegistrationSearchableFields,
} from './semesterRegistration.constants';
import { StudentSemesterRegistrationCourseService } from '../studentSemesterRegistrationCourse/studentSemesterRegistrationCourse.service';
import { StudentSemesterPaymentService } from '../studentSemesterPayment/studentSemesterPayment.service';
import { StudentEnrolledCourseMarkService } from '../studentEnrolledCourseMark/studentEnrolledCourseMark.service';

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
  return StudentSemesterRegistrationCourseService.enrollIntoCourse(
    authUserId,
    payload
  );
};

const withdrawFromCourse = async (
  authUserId: string,
  payload: IEnrolledCoursePayload
) => {
  return StudentSemesterRegistrationCourseService.withdrawFromCourse(
    authUserId,
    payload
  );
};

const confirmMyRegistration = async (authUserId: string) => {
  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING,
    },
    select: {
      id: true,
      minCredit: true,
      maxCredit: true,
    },
  });

  if (!semesterRegistration) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No ongoing semester found.');
  }

  const studentSemesterRegistration =
    await prisma.studentSemesterRegistration.findFirst({
      where: {
        semesterRegistration: {
          id: semesterRegistration?.id,
        },
        student: {
          studentId: authUserId,
        },
      },
      select: {
        id: true,
        totalCreditsTaken: true,
      },
    });

  if (!studentSemesterRegistration) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You are not recognized to this semester registration.'
    );
  }

  if (studentSemesterRegistration?.totalCreditsTaken === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You did not enroll any course.'
    );
  }

  if (
    studentSemesterRegistration?.totalCreditsTaken &&
    (studentSemesterRegistration?.totalCreditsTaken <
      semesterRegistration?.minCredit ||
      studentSemesterRegistration?.totalCreditsTaken >
        semesterRegistration?.maxCredit)
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Minimum ${semesterRegistration?.minCredit} credits to maximum ${semesterRegistration?.maxCredit} credits are allowed.`
    );
  }

  await prisma.studentSemesterRegistration.update({
    where: {
      id: studentSemesterRegistration.id,
    },
    data: {
      isConfirmed: true,
    },
  });

  return {
    message: 'Registration confirmed successfully.',
  };
};

const getMyRegistration = async (authUserId: string) => {
  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING,
    },
    include: {
      academicSemester: true,
    },
  });

  const studentSemesterRegistration =
    await prisma.studentSemesterRegistration.findFirst({
      where: {
        semesterRegistration: {
          id: semesterRegistration?.id,
        },
        student: {
          studentId: authUserId,
        },
      },
      include: {
        student: true,
      },
    });

  return { semesterRegistration, studentSemesterRegistration };
};

// start new semester after the registration has ended for the semester
/*
NOTE: this function is not optimized
const startNewSemester = async (id: string) => {
  const semesterRegistration = await prisma.semesterRegistration.findUnique({
    where: {
      id,
    },
    include: {
      academicSemester: true
    },
  });

  if (!semesterRegistration) {
    throw new ApiError(httpStatus.NOT_FOUND, "Semester registration not found.");
  }

  if (semesterRegistration.status !== SemesterRegistrationStatus.ENDED) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Semester registration is not ended yet.");
  }

  if (semesterRegistration.academicSemester.isCurrent) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Semester is already started.");
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.academicSemester.updateMany({
      where: {
        isCurrent: true,
      },
      data: {
        isCurrent: false,
      },
    });

    await transaction.academicSemester.update({
      where: {
        id: semesterRegistration.academicSemester.id
      },
      data: {
        isCurrent: true,
      }
    });

    const studentSemesterRegistration = await transaction.studentSemesterRegistration.findMany({
      where: {
        semesterRegistration: {
          id,
        },
        isConfirmed: true,
      },
    });

    // need to optimize
    await asyncForEach(
      studentSemesterRegistration,
      async (semester: StudentSemesterRegistration) => {
        if (semester.totalCreditsTaken) {
          const totalPaymentAmount = semester.totalCreditsTaken * 5000;

          await StudentSemesterPaymentService.createSemesterPayment(
            transaction, {
              studentId: semester.studentId,
              academicSemesterId: semesterRegistration.academicSemesterId,
              totalPaymentAmount
            }
          );
        }

        const studentSemesterRegistrationCourses = await transaction.studentSemesterRegistrationCourse.findMany({
          where: {
            semesterRegistration: {
              id
            },
            student: {
              id: semester.studentId
            }
          },
          include: {
            offeredCourse: {
              include: {
                course: true,
              }
            }
          },
        });

        await asyncForEach(
          studentSemesterRegistrationCourses,
          async (item: StudentSemesterRegistration & {
            offeredCourse: OfferedCourse & {
              course: Course
            }
          }) => {
            const alreadyEnrolledData = await transaction.studentEnrolledCourse.findFirst({
              where: {
                studentId: item.studentId,
                courseId: item.offeredCourse.courseId,
                academicSemesterId: semesterRegistration.academicSemesterId,
              }
            });

            if (!alreadyEnrolledData) {
              const enrolledCourseDetails = {
                studentId: item.studentId,
                courseId: item.offeredCourse.courseId,
                academicSemesterId: semesterRegistration.academicSemesterId,
              };

              const studentEnrolledCourseDetails = await transaction.studentEnrolledCourse.create({
                data: enrolledCourseDetails,
              });

              await StudentEnrolledCourseMarkService.createStudentEnrolledCourseDefaultMark(
                transaction,
                {
                  studentId: studentEnrolledCourseDetails.studentId,
                  studentEnrolledCourseId: studentEnrolledCourseDetails.id,
                  academicSemesterId: semesterRegistration.academicSemesterId
                }
              )
            }
          }
        )
      }
    );

  });

  return {
    message: "Semester started successfully.",
  };
};
*/

// start new semester after the registration has ended for the semester
const startNewSemester = async (id: string) => {
  const semesterRegistration = await prisma.semesterRegistration.findUnique({
    where: { id },
    include: { academicSemester: true },
  });

  if (!semesterRegistration) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Semester registration not found.'
    );
  }

  if (semesterRegistration.status !== SemesterRegistrationStatus.ENDED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Semester registration is not ended yet.'
    );
  }

  if (semesterRegistration.academicSemester.isCurrent) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Semester is already started.');
  }

  await prisma.$transaction(async transaction => {
    // Set all semesters to not current
    await transaction.academicSemester.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });

    // Set the current semester
    await transaction.academicSemester.update({
      where: { id: semesterRegistration.academicSemester.id },
      data: { isCurrent: true },
    });

    const studentSemesterRegistrations =
      await transaction.studentSemesterRegistration.findMany({
        where: {
          semesterRegistrationId: id,
          isConfirmed: true,
        },
      });

    // Get all student IDs and registrations to reduce database calls
    const studentIds = studentSemesterRegistrations.map(reg => reg.studentId);

    // Fetch all student registration courses in one call
    const studentCourses =
      await transaction.studentSemesterRegistrationCourse.findMany({
        where: {
          semesterRegistrationId: id,
          studentId: { in: studentIds },
        },
        include: {
          offeredCourse: { include: { course: true } },
        },
      });

    const studentCoursesMap: StudentCoursesMap = studentCourses.reduce(
      (map, item) => {
        if (!map[item.studentId]) {
          map[item.studentId] = [];
        }
        map[item.studentId].push(item);
        return map;
      },
      {} as StudentCoursesMap
    );

    // Handle student semester registrations and payments in parallel
    await Promise.all(
      studentSemesterRegistrations.map(async semester => {
        if (semester.totalCreditsTaken) {
          const totalPaymentAmount = semester.totalCreditsTaken * 5000;

          await StudentSemesterPaymentService.createSemesterPayment(
            transaction,
            {
              studentId: semester.studentId,
              academicSemesterId: semesterRegistration.academicSemesterId,
              totalPaymentAmount,
            }
          );
        }

        const courses = studentCoursesMap[semester.studentId] || [];

        await Promise.all(
          courses.map(
            async (item: {
              studentId: any;
              offeredCourse: { courseId: any };
            }) => {
              const alreadyEnrolled =
                await transaction.studentEnrolledCourse.findFirst({
                  where: {
                    studentId: item.studentId,
                    courseId: item.offeredCourse.courseId,
                    academicSemesterId: semesterRegistration.academicSemesterId,
                  },
                });

              if (!alreadyEnrolled) {
                const studentEnrolledCourse =
                  await transaction.studentEnrolledCourse.create({
                    data: {
                      studentId: item.studentId,
                      courseId: item.offeredCourse.courseId,
                      academicSemesterId:
                        semesterRegistration.academicSemesterId,
                    },
                  });

                await StudentEnrolledCourseMarkService.createStudentEnrolledCourseDefaultMark(
                  transaction,
                  {
                    studentId: studentEnrolledCourse.studentId,
                    studentEnrolledCourseId: studentEnrolledCourse.id,
                    academicSemesterId: semesterRegistration.academicSemesterId,
                  }
                );
              }
            }
          )
        );
      })
    );
  });

  return { message: 'Semester started successfully.' };
};

export const SemesterRegistrationService = {
  createSemesterRegistration,
  getByIdFromDB,
  getAllFromDB,
  deleteByIdFromDB,
  updateOneInDB,
  startMyRegistration,
  enrollIntoCourse,
  withdrawFromCourse,
  confirmMyRegistration,
  getMyRegistration,
  startNewSemester,
};
