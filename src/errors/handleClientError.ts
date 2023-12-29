import { IGenericErrorMessage } from '../interfaces/error';
import { Prisma } from "@prisma/client";

const handleClientError = (error: Prisma.PrismaClientKnownRequestError) => {
  let errors: IGenericErrorMessage[] = [];
  let message = "";
  const statusCode = 400;

  if (error.code === 'P2025') {
    message = (error.meta?.cause as string) || 'Record not found.'
    errors = [
      {
        path: "",
        message
      }
    ]
  } else if (error.code === 'P2003') {
    if (error.message.includes('delete()` invocation:')) {
      message = "Delete failed.";
      errors = [
        {
          path: "",
          message
        }
      ]
    }
  }


  return {
    statusCode,
    message: 'Cast Error',
    errorMessages: errors,
  };
};

export default handleClientError;
