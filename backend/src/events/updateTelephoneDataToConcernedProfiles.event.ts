
export class UpdateTelephoneToConcernedProfilesEvent {
    constructor(
        public email: string,
        public telephone: string
    ) {}
}