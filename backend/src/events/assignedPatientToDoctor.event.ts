import {MedicalDepartments} from '../enums/medical.department.enum'

export class AssignedPatientToDoctorEvent {
    constructor(
        // attributes of the assigned doctor
        public medicalDepartment: MedicalDepartments,
        public doctorFirstName: string,
        public doctorLastName: string,

        // attributes of the patient
        public imageUrl ?: string,
        public firstName ?: string,
        public lastName ?: string,
        public age ?: number,
        public address ?: string,
        public telephone ?: string,
        public occupation ?: string,
        public maritalStatus ?: string,
        public pharmacyTelephone ?: string

    ) {}
}