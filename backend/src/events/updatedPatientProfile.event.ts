
export class UpdatedPatientProfileEvent {
    constructor(
        public firstName ?: string,
        public lastName ?: string,
        public email ?: string,
        public age ?: number,
        public address ?: string,
        public telephone ?: string,
        public occupation ?: string,
        public maritalStatus ?: string,
    ) {}
}