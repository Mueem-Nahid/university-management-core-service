import express from 'express';
import { OfferedCourseClassScheduleController } from './offeredCourseClassSchedule.controller';
import { OfferedCourseClassScheduleValidation } from './offeredCourseClassSchedule.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.get(
  '/',
  OfferedCourseClassScheduleController.getAllOfferedCourseClassSchedule
);

router.get('/:id', OfferedCourseClassScheduleController.getByIdFromDB);

router.post(
  '/',
  validateRequest(OfferedCourseClassScheduleValidation.create),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  OfferedCourseClassScheduleController.createClassSchedule
);

router.patch(
  '/:id',
  validateRequest(OfferedCourseClassScheduleValidation.update),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  OfferedCourseClassScheduleController.updateOneInDB
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  OfferedCourseClassScheduleController.deleteByIdFromDB
);

export const OfferedCourseClassScheduleRoutes = router;
