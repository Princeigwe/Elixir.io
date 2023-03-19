const nodemailer = require ('nodemailer')

export class EmailSender {

    async sendMail(data:{}) {
        const transport = {
            host: process.env.ELASTIC_EMAIL_SERVER_HOST,
            port: process.env.ELASTIC_EMAIL_PORT,
            auth: {
                user: process.env.ELASTIC_EMAIL_USERNAME,
                pass: process.env.ELASTIC_EMAIL_PASSWORD,
            },
        }
        
        let transporter = nodemailer.createTransport(transport)

        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log("Server is ready to take our messages");
            }
        });
        
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