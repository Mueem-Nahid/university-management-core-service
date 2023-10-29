import express from 'express';
import { SemesterRegistrationController } from './semesterRegistration.controller';

const router = express.Router();

router.post('/', SemesterRegistrationController.createSemesterRegistration);

export const SemesterRegistrationRoutes = router;
