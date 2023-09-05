export const gender: string[] = ['male', 'female'];

export const bloodGroup: string[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

export const facultyFilterableFields: string[] = [
  'searchTerm',
  'id',
  'gender',
  'bloodGroup',
  'email',
  'contactNo',
  'emergencyContactNo',
  'academicFaculty',
  'academicDepartment',
  'designation',
];

export const facultySearchableFields: string[] = [
  'firstName',
  'lastName',
  'middleName',
  'email',
  'contactNo',
  'facultyId',
  'designation',
];

export const facultyRelationalFields: string[] = [
  'academicFacultyId',
  'academicDepartmentId',
];

export const facultyRelationalFieldsMapper: { [key: string]: string } = {
  academicFacultyId: 'academicFaculty',
  academicDepartmentId: 'academicDepartment',
};
