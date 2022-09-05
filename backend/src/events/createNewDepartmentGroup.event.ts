import {MedicalDepartments} from '../enums/medical.department.enum'

export class NewDepartmentConsultantEvent { 
    constructor(
        public firstName: string,
        public lastName: string,
        public department: MedicalDepartments
    ) {}
}