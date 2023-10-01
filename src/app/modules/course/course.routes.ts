import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { CourseController } from './course.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CourseValidation } from './course.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(CourseValidation.create),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  CourseController.createCourse
);

router.get('/', CourseController.getAllFromDB);

router.get('/:id', CourseController.getByIdFromDB);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  CourseController.deleteByIdFromDB
);

export const CourseRoutes = router;
