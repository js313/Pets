const nodemailer = require('nodemailer')

const sendEmail = async options => {
    if (process.env.NODE_ENV === 'development') {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST_DEV,
            port: process.env.EMAIL_HOST_DEV,
            auth: {
                user: process.env.EMAIL_USER_DEV,
                pass: process.env.EMAIL_PASS_DEV
            }
        })
        const data = {
            from: "Admin <admin@pets.io>",
            to: options.to,
            subject: options.subject,
            text: options.text,
            // html: option.html
        }
        try {
            const response = await transporter.sendMail(data)
            console.log(response)
        } catch (error) {
            console.log(error)
        }
    }
    else if (process.env.NODE_ENV === 'production') {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })
        const data = {
            from: `Pets Admin<${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text
        }
        try {
            const response = await transporter.sendMail(data)
            // console.log(response)
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = sendEmail