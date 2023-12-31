import express from "express";
import { OfferedCourseController } from "./offeredCourse.controller";
import { OfferedCourseValidation } from "./offeredCourse.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";

const router = express.Router();

router.post('/',
  validateRequest(OfferedCourseValidation.createOfferedCourse),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  OfferedCourseController.createOfferedCourse);

export const OfferedCourseRoutes = router;