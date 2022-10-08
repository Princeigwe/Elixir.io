import {MedicalDepartments} from '../enums/medical.department.enum'

export class AssignedPatientToDoctorEvent {
    constructor(
        public medicalDepartment: MedicalDepartments,
        public doctorFirstName: string,
        public doctorLastName: string,

        public imageUrl ?: string,
        public firstName ?: string,
        public lastName ?: string,
        public age ?: number,
        public address ?: string,
        public telephone ?: string,
        public occupation ?: string,
        public maritalStatus ?: string,
        public medicalIssues ?: string[],
        public prescriptions ?: [],
        public pharmacyTelephone ?: string

    ) {}
}