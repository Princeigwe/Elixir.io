import {User} from '../users/users.schema'
import {DoctorHierarchy} from '../enums/doctor.hierarchy.enum'


export class NewMedicalProviderEvent {
    constructor( 
        public user: User, 
        public firstName: string, 
        public lastName: string,
        public hierarchy: DoctorHierarchy
    ) {}
}