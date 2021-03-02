let User = require('../models/userModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");
const bcrypt = require('bcrypt');

const saltRounds = process.env.SALT_ROUNDS;

// Permet de récupérer les informations d'un utilisateur sur base de son mail
// Method : POST 
// Body : mail
exports.fetchUser = (req, res) => {
    let user = new User(null, null, null, null, req.body.mail, null, null);
    res.status(400);
    if (!toolbox.checkMail(user.mail)) {
        res.send("L'adresse mail indiquée ne respecte pas le format d'une adresse mail correcte");
        return;
    }
    db.db.query("SELECT * FROM users WHERE mail = ?;", user.mail, (error, resultSQL) => {
        if (error) {
            res.send(error);
            return;
        }
        else {
            res.status(200);
            if (resultSQL.length === 0) {
                res.send("Désolé, il n'existe pas d'utilisateur avec l'adresse mail : " + user.mail);
                return;
            } else {
                delete resultSQL[0].password
                res.send(resultSQL[0]);
                return;
            }
        }
    });
}

// Permet de créer un nouvel utilisateur s'il n'existe pas déjà
// Method : POST 
// Body : name, surname, mail, password
exports.createUser = (req, res) => {
    let user = new User(null, 1, req.body.name, req.body.surname, req.body.mail, null, null);
    res.status(400);
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (err) {
            res.send(err);
            return;
        }
        console.log(hash)
        user.password = hash;
        if (!toolbox.checkMail(user.mail)) {
            res.send("L'adresse mail ne respecte pas le format d'une adresse existante");
            return;
        }
        db.db.query("INSERT INTO users (role, name, surname, mail, password) VALUES (?, ?, ?, ?, ?);", [1, user.name, user.surname, user.mail, user.password], (error, resultSQL) => {
            if (error) {
                if (error.errno === 1062) {
                    res.send("Cet utilisateur existe déjà")
                    return;
                }
                res.send(error);
                return;
            }
            else {
                user.id = resultSQL.insertId;
                user.password = null;
                res.status(200).send(user);
                return;
            }
        });
    });
}

exports.connectUser = (req, res) => {
    //connecte un user
}

exports.upgradeUser = (req, res) => {
    //permet à un user de devenir premium
}

exports.forgotPwdUser = (req, res) => {
    //système de récupération de mot de passe du user
}

