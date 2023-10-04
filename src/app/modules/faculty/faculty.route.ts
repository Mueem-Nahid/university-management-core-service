import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { FacultyController } from './faculty.controller';
import { FacultyValidation } from './faculty.validations';

const router = express.Router();

router.post(
  '/',
  validateRequest(FacultyValidation.createFacultyZodSchema),
  FacultyController.createFaculty
);

router.get('/:id', FacultyController.getSingleFaculty);

router.get('/', FacultyController.getAllFaculties);

router.patch(
  '/:id',
  validateRequest(FacultyValidation.updateFacultyZodSchema),
  FacultyController.updateFaculty
);

router.delete('/:id', FacultyController.deleteFaculty);

router.post('/:id/assign-courses', FacultyController.assignCourses);

router.delete('/:id/remove-courses', FacultyController.removeAssignedCourse);

export const FacultyRoutes = router;
