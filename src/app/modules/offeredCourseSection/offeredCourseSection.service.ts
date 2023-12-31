import { OfferedCourseSection } from "@prisma/client";
import prisma from "../../../shared/prisma";

const createOfferedCourseSection = async (data: OfferedCourseSection): Promise<OfferedCourseSection> => {
  const result = await prisma.offeredCourseSection.create({
    data
  });
  return result;
}

export const OfferedCourseSectionService = {
  createOfferedCourseSection
}