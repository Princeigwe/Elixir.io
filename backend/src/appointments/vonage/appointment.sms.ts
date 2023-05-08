const { Vonage } = require('@vonage/server-sdk')


const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET
})

export class VonageSMS {

    async sendScheduleMessage(doctorTelephone: string, patientName: string, date: Date) {
        const from = process.env.VONAGE_BRAND_NAME
        const to = doctorTelephone
        const text = `You have a new appointment scheduled with ${patientName} on ${date}.`

        await vonage.sms.send({to, from, text})
        .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
    }

    async sendRescheduleMessageByPatient(doctorTelephone: string, patientName: string, date: Date) {
        const from = process.env.VONAGE_BRAND_NAME
        const to = doctorTelephone
        const text = `The appointment with ${patientName} is now rescheduled to ${date}.`

        await vonage.sms.send({to, from, text})
        .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
    }

    async sendRescheduleMessageByMedicalProvider(patientTelephone: string, doctorName: string, date: Date) {
        const from = process.env.VONAGE_BRAND_NAME
        const to = patientTelephone
        const text = `The appointment with your doctor, ${doctorName}, has been rescheduled to ${date}.`

        await vonage.sms.send({to, from, text})
        .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
    }

}