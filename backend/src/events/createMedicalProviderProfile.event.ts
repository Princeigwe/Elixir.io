import {User} from '../users/users.schema'

export class NewMedicalProviderEvent {
    constructor( 
        public user: User, 
        public firstName: string, 
        public lastName: string
    ) {}
}