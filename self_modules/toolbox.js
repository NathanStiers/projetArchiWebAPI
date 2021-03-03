const nodemailer = require('nodemailer');

exports.checkMail = (mail) => {
    var re = /\S+@\S+\.\S+/;
    return re.test(mail);
}

exports.sendMail = (to, subject, text) => {
    let mailOptions = {
        from: process.env.NODE_MAILER_USER,
        to: to,
        subject: subject,
        text: text
    };
    const transporter = nodemailer.createTransport({
        service: process.env.NODE_MAILER_SERVICE,
        auth: {
            user: process.env.NODE_MAILER_USER,
            pass: process.env.NODE_MAILER_PWD
        }
    });
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                reject(error);
                return;
            }
            else {
                resolve(info);
                return;
            }
        });
    });
}