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

router.patch(
  '/:id',
  validateRequest(CourseValidation.update),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  CourseController.updateCourse
);

router.get('/', CourseController.getAllFromDB);

router.get('/:id', CourseController.getByIdFromDB);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  CourseController.deleteByIdFromDB
);

router.post(
  '/:id/assign-faculties',
  validateRequest(CourseValidation.assignOrRemoveFaculties),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  CourseController.assignFaculties
);

router.delete(
  '/:id/remove-faculties',
  validateRequest(CourseValidation.assignOrRemoveFaculties),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  CourseController.removeAssignedFaculty
);

export const CourseRoutes = router;
