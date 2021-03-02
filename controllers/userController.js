let User = require('../models/userModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");
const bcrypt = require('bcrypt');

const saltRounds = 12;

// PRIVATE ==> Permet de récupérer les informations d'un utilisateur sur base de son mail
__fetchUser = mail => {
    return new Promise((resolve, reject) => {
        let user = new User(null, null, null, null, mail, null, null);
        if (!toolbox.checkMail(user.mail)) {
            reject(400);
            return;
        }
        db.db.query("SELECT * FROM users WHERE mail = ?;", user.mail, (error, resultSQL) => {
            if (error) {
                reject(500);
                return;
            }
            else {
                if (resultSQL.length === 0) {
                    reject(403);
                    return;
                } else {
                    resolve(resultSQL[0]);
                    return;
                }
            }
        });
    });

}

// Permet de créer un nouvel utilisateur s'il n'existe pas déjà
// Method : POST 
// Body : name, surname, mail, password
exports.createUser = (req, res) => {
    let user = new User(null, 1, req.body.name, req.body.surname, req.body.mail, null, null);
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
        db.db.query("INSERT INTO users (role, name, surname, mail, password) VALUES (?, ?, ?, ?, ?);", [1, user.name, user.surname, user.mail, user.password], (error, resultSQL) => {
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
                res.status(201).json(user);
                return;
            }
        });
    });
}

// Permet d'authentifier un utilisateur sur base de son mail et de son mot de passe
// Method : POST 
// Body : mail, password
exports.connectUser = async (req, res) => {
    let user = new User(null, null, null, null, req.body.mail, null, null);
    __fetchUser(user.mail).then(resultUser => {
        bcrypt.compare(req.body.password, resultUser.password, function(err, result) {
            if(err){
                res.status(500).send(err);
                return;
            }else if(result){
                delete resultUser.password
                res.status(200).json(resultUser);
                return;
            }else{
                res.status(401).send("Authentification incorrecte");
                return;
            }
        });
    }).catch(err => {
        if(err===400){
            res.status(400).send("L'adresse mail indiquée ne respecte pas le format d'une adresse mail correcte");
            return;
        }else if(err===403){
            res.status(403).send("Désolé, il n'existe pas d'utilisateur avec l'adresse mail : " + user.mail);
            return;
        }else{
            res.status(500).send(error);
            return;
        }
    })
    return;
}

// Permet de modifier le rôle d'un utilisateur classique vers utilisateur premium sur base de son id
// Method : GET
// Params : id
exports.upgradeUser = (req, res) => {
    db.db.query("UPDATE users SET role = ? WHERE id = ?;", [2, req.params.id], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error);
            return;
        }
        else {
            res.status(200).send("Vous êtes maintenant un utilisateur premium")
            return;
        }
    });
}

exports.forgotPwdUser = (req, res) => {
    //système de récupération de mot de passe du user sur base de son id
}

