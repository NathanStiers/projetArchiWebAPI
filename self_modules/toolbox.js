const nodemailer = require('nodemailer');
const db = require('../self_modules/db');
const axios = require('axios');

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

exports.cyptoValuesCall = () => {
    return new Promise((resolve, reject) => {
        axios
            .get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", {
                params: {
                    'start': '1',
                    'limit': process.env.COIN_MARKET_CAP_API_LIMIT,
                    'convert': process.env.COIN_MARKET_CAP_API_CONVERT
                },
                headers: { 'X-CMC_PRO_API_KEY': process.env.COIN_MARKET_CAP_API_TOKEN }
            })
            .then((response) => {
                resolve(response.data.data)
                return;
            })
            .catch((error) => {
                reject(error)
                return;
            });
    });
}

exports.fetchAssetsBasedOnType = (id) => {
    return new Promise((resolve, reject) => {
        db.db.query("SELECT type FROM wallets WHERE id = ?;", id, (error, resultSQL) => {
            if (error) {
                reject(500)
                return;
            }
            else {
                db.db.query("SELECT * FROM assets WHERE type = ?;", resultSQL[0].type, (error, resultSQL) => {
                    if (error) {
                        reject(500)
                        return;
                    }
                    else {
                        let assets = []
                        resultSQL.forEach(r => {
                            assets.push(r);
                        });
                        resolve({assets, type : resultSQL[0].type})
                        return;
                    }
                });
            }
        });
    });
}

exports.fetchAssetsFromType = (req, res) => {
    this.fetchAssetsBasedOnType(req.params.id).then(result => {
        res.status(200).json(result)
        return;
    }).catch(error => {
        res.status(500).send(error)
        return;
    })
}