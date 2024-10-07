import {ExamType, PrismaClient, StudentEnrolledCourseMark} from "@prisma/client";
import {ITXClientDenyList} from "@prisma/client/runtime/library";
import {
  ICreateStudentEnrolledCourseDefaultMarkPayload,
  IStudentEnrolledCourseMarkFilterRequest
} from "./studentEnrolledCourseMark.interface";
import {IPaginationOptions} from "../../../interfaces/pagination";
import {IGenericResponse} from "../../../interfaces/common";
import {paginationHelpers} from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";

const createStudentEnrolledCourseDefaultMark = async (
  prismaTransaction: Omit<PrismaClient, ITXClientDenyList>,
  payload: ICreateStudentEnrolledCourseDefaultMarkPayload) => {
  console.log("in create Student Enrolled Course Default Mark")
  /* const isExistMidTerm = await prismaTransaction.studentEnrolledCourseMark.findMany({
    where:{
      examType: ExamType.MIDTERM,
      student:{
        id: payload.studentId,
      },
      studentEnrolledCourse:{
        id: payload.studentEnrolledCourseId
      },
      academicSemester:{
        id: payload.academicSemesterId,
      }
    }
  });

  if(!isExistMidTerm) {
    console.log("here")
  } */
  await prismaTransaction.studentEnrolledCourseMark.createMany({
    data: [
      {
        studentId: payload.studentId,
        studentEnrolledCourseId: payload.studentEnrolledCourseId,
        academicSemesterId: payload.academicSemesterId,
        examType: ExamType.MIDTERM,
      },
      {
        studentId: payload.studentId,
        studentEnrolledCourseId: payload.studentEnrolledCourseId,
        academicSemesterId: payload.academicSemesterId,
        examType: ExamType.FINAL,
      },
    ],
  });
};

const getAllFromDB = async (
  filters: IStudentEnrolledCourseMarkFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<StudentEnrolledCourseMark[]>> => {
  const {limit, page} = paginationHelpers.calculatePagination(options);
  const marks = await prisma.studentEnrolledCourseMark.findMany({
    where: {
      student: {
        id: filters.studentId
      },
      academicSemester: {
        id: filters.academicSemesterId
      },
      studentEnrolledCourse: {
        course: {
          id: filters.courseId
        }
      }
    },
    include: {
      studentEnrolledCourse: {
        include: {
          course: true
        }
      },
      student: true
    }
  });
  return {
    meta: {
      total: marks.length,
      page,
      limit
    },
    data: marks
  };
};

const updateStudentMarks = async (payload) => {
  console.log(" update marks")
}

export const StudentEnrolledCourseMarkService = {
  createStudentEnrolledCourseDefaultMark,
  getAllFromDB,
  updateStudentMarks
}