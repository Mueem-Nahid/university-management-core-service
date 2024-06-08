import {ICreateStudentPaymentPayload} from "./studentSemesterPayment.interface";
import {PrismaClient} from "@prisma/client";
import {ITXClientDenyList} from "@prisma/client/runtime/library";

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

export const StudentSemesterPaymentService = {
  createSemesterPayment,
}