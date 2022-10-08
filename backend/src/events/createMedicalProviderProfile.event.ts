import {User} from '../users/users.schema'
import {DoctorHierarchy} from '../enums/doctor.hierarchy.enum'
import {MedicalDepartments} from '../enums/medical.department.enum'


export class NewMedicalProviderEvent {
    constructor( 
        public user: User, 
        public firstName: string, 
        public lastName: string,
        public email: string,
        public hierarchy: DoctorHierarchy,
        public department: MedicalDepartments,
        public telephone: string,
        public address: string
    ) {}
}