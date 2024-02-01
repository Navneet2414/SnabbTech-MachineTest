
const nodemailer = require('nodemailer');

exports.emailService = async function (payload) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        auth: {
            user: "navneetyadavera@gmail.com",
          pass: "bmym jowj rovc vqod",
            secret: "St4rk_jatt",
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    const mailOptions = {
        from:'navneetyadavera@gmail.com',
        to: payload.to,
        subject: payload.subject,
        html: payload.message,
    };

    try {
        console.log("Email is sent ", mailOptions);
        return await transporter.sendMail(mailOptions); 
    } catch (err) {
        console.error('Failed to send email:', err);
        throw err; 
    }
};


