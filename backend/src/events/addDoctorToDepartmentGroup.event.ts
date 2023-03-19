import {MedicalDepartments} from '../enums/medical.department.enum'
import {DoctorHierarchy} from '../enums/doctor.hierarchy.enum'

export class NewMedicalDepartmentDoctorEvent {
    constructor(
        public firstName: string,
        public lastName: string,
        public department: MedicalDepartments,
        public hierarchy: DoctorHierarchy,
        public email: string
    ) {}
}