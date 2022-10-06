import {User} from '../users/users.schema'

export class NewUserEvent {
    constructor( public user: User, public email: string) {}
}