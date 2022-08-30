import {User} from '../users/users.schema'

export class NewUserEvent {
    constructor( public user: User) {}
}