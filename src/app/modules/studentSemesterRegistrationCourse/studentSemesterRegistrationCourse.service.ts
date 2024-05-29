import {IEnrolledCoursePayload} from "../semesterRegistration/semesterRegistration.interface";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import {SemesterRegistrationStatus} from "@prisma/client";

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

export const StudentSemesterRegistrationCourseService = {
  enrollIntoCourse,
  withdrawFromCourse
};