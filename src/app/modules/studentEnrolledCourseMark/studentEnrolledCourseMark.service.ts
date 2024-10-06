import {ExamType, PrismaClient} from "@prisma/client";
import {ITXClientDenyList} from "@prisma/client/runtime/library";
import {ICreateStudentEnrolledCourseDefaultMarkPayload} from "./studentEnrolledCourseMark.interface";

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
}

export const StudentEnrolledCourseMarkService = {
  createStudentEnrolledCourseDefaultMark,
}