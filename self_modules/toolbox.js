const nodemailer = require('nodemailer');
const db = require('../self_modules/db');

// Permet de vérifier la conformité d'un mail
exports.checkMail = (mail) => {
    var re = /\S+@\S+\.\S+/;
    return re.test(mail);
}

// Permet d'envoyer un mail personnalisé
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

// Permet de faire un mapping des types entre label et id.
exports.mapping_label_id_types = () => {
    return new Promise((resolve, reject) => {
        db.db.query("SELECT * FROM types;", (error, resultSQL) => {
            if (error) {
                reject(error)
                return;
            }
            else {
                let mapping = {}
                resultSQL.forEach(t => {
                    mapping[t.id] = t.label;
                    mapping[t.label] = t.id;
                });
                resolve(mapping)
                return;
            }
        });
    });
}


// Permet de faire un mapping des roles entre label et id.
exports.mapping_label_id_roles = () => {
    return new Promise((resolve, reject) => {
        db.db.query("SELECT * FROM roles;", (error, resultSQL) => {
            if (error) {
                reject(error)
                return;
            }
            else {
                let mapping = {}
                resultSQL.forEach(r => {
                    mapping[r.id] = r.label;
                    mapping[r.label] = r.id;
                });
                resolve(mapping)
                return;
            }
        });
    });
}

// Permet de supprimer un portefeuille sur base de son id et de son id_user
// Method : GET 
// Body : 
exports.fetchAllTypes = (req, res) => {
    db.db.query("SELECT * FROM types;", (error, resultSQL) => {
        if (error) {
            res.status(500).send(error)
            return;
        }
        else {
            let mapping = {}
            resultSQL.forEach(r => {
                mapping[r.id] = r.label;
            });
            res.status(200).json(mapping)
            return;
        }
    });
}