export class ConversationRoomEvent {
    constructor(
        public name: string,
        public patientEmail: string,
        public medicalProviderEmail: string
    ) {}
}