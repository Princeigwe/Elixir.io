const nodemailer = require ('nodemailer')

export class EmailSender {

    async sendMail(data) {
        const transport = {
            host: process.env.ELASTIC_EMAIL_SERVER_HOST,
            port: process.env.ELASTIC_EMAIL_SERVER_HOST,
            secure: false, 
            auth: {
                user: process.env.ELASTIC_EMAIL_USERNAME,
                pass: process.env.ELASTIC_EMAIL_PASSWORD,
            },
        }
        
        let transporter = nodemailer.createTransport(transport)
        transporter.sendMail(data, function(error, info) {
            if(error){
                console.log(error)
            }
            else{
                console.log(`Email sent: ${info.response}`)
            }
        })
    }
}