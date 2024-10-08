import express from 'express';
import { StudentEnrolledCourseMarkController } from './studentEnrolledCourseMark.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.FACULTY),
  StudentEnrolledCourseMarkController.getAllFromDB
);

router.patch(
  '/update-term-marks',
  StudentEnrolledCourseMarkController.updateStudentTermMarks
);

router.patch(
  '/update-final-marks',
  StudentEnrolledCourseMarkController.updateStudentFinalMarks
);

export const StudentEnrolledCourseMarkRoutes = router;
