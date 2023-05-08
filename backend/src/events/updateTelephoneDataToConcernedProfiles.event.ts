
export class UpdateTelephoneToConcernedProfilesEvent {
    constructor(
        public email: string,
        public telephone?: string // this is optional, in case the patient does not have a telephone number from the very beginning
    ) {}
}