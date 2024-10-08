export type ICreateStudentPaymentPayload = {
  studentId: string;
  academicSemesterId: string;
  totalPaymentAmount: number;
};

export type IStudentSemesterPaymentFilterRequest = {
  searchTerm?: string | undefined;
  academicSemesterId?: string | undefined;
  studentId?: string | undefined;
};
