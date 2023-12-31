import { OfferedCourseSection } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";

const createOfferedCourseSection = async (data: OfferedCourseSection): Promise<OfferedCourseSection> => {
  const isOfferedCourseExist = await prisma.offeredCourse.findFirst({
    where: {
      id: data.offeredCourseId
    }
  });
  if (!isOfferedCourseExist)
    throw new ApiError(httpStatus.BAD_REQUEST, "Offered course does not exist.");

  data.semesterRegistrationId = isOfferedCourseExist.semesterRegistrationId;

  const result = await prisma.offeredCourseSection.create({
    data
  });
  return result;
}

export const OfferedCourseSectionService = {
  createOfferedCourseSection
}