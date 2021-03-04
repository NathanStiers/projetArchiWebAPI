let User = require('../models/userModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");
const bcrypt = require('bcrypt');
const generator = require('generate-password');

const saltRounds = 12;

let mapping_label_id_roles = {};

// Permet de créer un nouvel utilisateur s'il n'existe pas déjà
// Method : POST 
// Body : name, surname, mail, password
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.createUser = (req, res) => {
    let user = new User(null, 1, req.body.name, req.body.surname, req.body.mail, null, []);
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        user.password = hash;
        if (!toolbox.checkMail(user.mail)) {
            res.status(400).send("L'adresse mail ne respecte pas le format d'une adresse existante");
            return;
        }
        toolbox.mapping_label_id_roles().then(result => {
            mapping_label_id_roles = result
            db.db.query("INSERT INTO users (role, name, surname, mail, password) VALUES (?, ?, ?, ?, ?);", [mapping_label_id_roles['basic'], user.name, user.surname, user.mail, user.password], (error, resultSQL) => {
                if (error) {
                    if (error.errno === 1062) {
                        res.status(403).send("Cet utilisateur existe déjà")
                        return;
                    }
                    res.status(500).send(error);
                    return;
                }
                else {
                    user.id = resultSQL.insertId;
                    user.password = null;
                    user.role = "basic";
                    res.status(201).json(user);
                    return;
                }
            });
            return;
        }).catch(error => {
            console.log(error);
            res.status(500).send(error);
            return;
        })
    });
}

// Permet d'authentifier un utilisateur sur base de son mail et de son mot de passe
// Method : POST 
// Body : mail, password
exports.connectUser = (req, res) => {
    let user = new User(null, null, null, null, req.body.mail, null, []);
    __fetchUserByMail(user.mail).then(resultUser => {
        bcrypt.compare(req.body.password, resultUser.password, function (err, result) {
            if (err) {
                res.status(500).send(err);
                return;
            } else if (result) {
                delete resultUser.password
                res.status(200).json(resultUser);
                return;
            } else {
                res.status(401).send("Authentification incorrecte");
                return;
            }
        });
    }).catch(err => {
        if (err === 400) {
            res.status(400).send("L'adresse mail indiquée ne respecte pas le format d'une adresse mail correcte");
            return;
        } else if (err === 403) {
            res.status(403).send("Désolé, il n'existe pas d'utilisateur avec l'adresse mail : " + user.mail);
            return;
        } else {
            res.status(500).send(err);
            return;
        }
    })
}

// Permet de modifier le rôle d'un utilisateur classique vers utilisateur premium sur base de son id
// Method : GET
// Body : id
exports.upgradeUser = (req, res) => {
    toolbox.mapping_label_id_roles().then(result => {
        mapping_label_id_roles = result
        db.db.query("UPDATE users SET role = ? WHERE id = ?;", [mapping_label_id_roles['premium'], req.body.id], (error, resultSQL) => {
            if (error) {
                res.status(500).send(error);
                return;
            }
            else {
                res.status(200).send("Vous êtes maintenant un utilisateur premium")
                return;
            }
        });
        return;
    }).catch(error => {
        console.log(error);
        res.status(500).send(error);
        return;
    })
}

// Permet à un utilisateur étourdi de récupérer son mot de passe sur base de son email
// Method : POST
// Body : email
exports.forgotPwdUser = (req, res) => {
    let user = new User(null, null, null, null, req.body.mail, null, []);
    __fetchUserByMail(user.mail).then(resultUser => {
        console.log("hello")
        let newPassword = generator.generate({
            length: 10,
            numbers: true
        });
        user.id = resultUser.id
        bcrypt.hash(newPassword, saltRounds, (err, hash) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            db.db.query("UPDATE users SET password = ? WHERE id = ?;", [hash, user.id], (error, resultSQL) => {
                if (error) {
                    res.status(500).send(error);
                    return;
                }
                else {
                    toolbox.sendMail(resultUser.mail, "Confidential : Your new password", newPassword).then(result => {
                        console.log('Email sent: ' + result);
                        res.status(200).send("Email envoyé")
                        return;
                    }).catch(error => {
                        console.log(error);
                        res.status(500).send(error);
                        return;
                    });
                }
            });
        })
    }).catch(err => {
        if (err === 400) {
            res.status(400).send("L'adresse mail indiquée ne respecte pas le format d'une adresse mail correcte");
            return;
        } else if (err === 403) {
            res.status(403).send("Désolé, il n'existe pas d'utilisateur avec l'adresse mail : " + user.mail);
            return;
        } else {
            res.status(500).send(err);
            return;
        }
    })
    return;
}

// PRIVATE ==> Permet de récupérer les informations d'un utilisateur sur base de son mail
__fetchUserByMail = mail => {
    return new Promise((resolve, reject) => {
        if (!toolbox.checkMail(mail)) {
            reject(400);
            return;
        }
        db.db.query("SELECT * FROM users WHERE mail = ?;", mail, (error, resultSQL) => {
            if (error) {
                reject(500);
                return;
            }
            else {
                if (resultSQL.length === 0) {
                    reject(403);
                    return;
                } else {
                    toolbox.mapping_label_id_roles().then(result => {
                        mapping_label_id_roles = result
                        resultSQL[0].role = mapping_label_id_roles[resultSQL[0].role]
                        resolve(resultSQL[0]);
                        return;
                    }).catch(error => {
                        console.log(error)
                        reject(error);
                        return;
                    })
                }
            }
        });
    });
}

// PACKAGE ==> Permet de récupérer les informations d'un utilisateur sur base de son id
__fetchUserById = id => {
    return new Promise((resolve, reject) => {
        if (!toolbox.checkMail(id)) {
            reject(400);
            return;
        }
        db.db.query("SELECT * FROM users WHERE id = ?;", user.id, (error, resultSQL) => {
            if (error) {
                reject(500);
                return;
            }
            else {
                if (resultSQL.length === 0) {
                    reject(403);
                    return;
                } else {
                    toolbox.mapping_label_id_roles().then(result => {
                        mapping_label_id_roles = result
                        resultSQL[0].role = mapping_label_id_roles[role]
                        resolve(resultSQL[0]);
                        return;
                    }).catch(error => {
                        reject(error);
                        return;
                    })
                }
            }
        });
    });
}