let Wallet = require('../models/walletModel');
let User = require('../models/userModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");

// TODO : changer l'attribut 'user_role' via un appel au userController
// Permet de récupérer les différents portefeuilles d'un utilisateur
// Method : GET 
// Body : user_id, user_role
exports.fetchAllWallets = (req, res) => {
    let user = new User(req.body.id, req.body.role, null, null, null, null, []);
    db.db.query("SELECT * FROM wallets WHERE user_id = ? LIMIT ?;", [user.id, user.role === "premium" ? 10 : 3], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error);
            return;
        }
        else {
            resultSQL.forEach(w => {
                user.wallet_list.push(new Wallet(w.id, w.type, w.label, w.creation_date, []))
            });
            res.status(200).json(user);
            return;
        }
    });
}

// TODO : changer les body 'role' et 'nbr_existing_wallet' via un appel au userController
// Permet de créer un portefeuille vide si la limite de l'utilisateur n'est pas atteinte
// Method : POST 
// Body : user_id, role, type, label
exports.createWallet = (req, res) => {
    let user = new User(req.body.user_id, req.body.role, null, null, null, null, []);
    console.log(user)
    if ((req.body.nbr_existing_wallet >= 3 && user.role === "basic") || (req.body.nbr_existing_wallet >= 10 && user.role === "premium")) {
        res.status(403).send("Vous avez atteint votre limite de création de portefeuilles");
        return;
    }
    let date = new Date();
    date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2)
    let wallet = new Wallet(null, req.body.type, req.body.label, date, []);
    db.db.query("INSERT INTO wallets (type, user_id, label, creation_date) VALUES (?, ?, ?, ?);", [wallet.type, user.role === "premium" ? 10 : 3, wallet.label, date], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error);
            return;
        }
        else {
            wallet.id = resultSQL.insertId;
            res.status(201).json(wallet);
            return;
        }
    });
}

exports.deleteWallet = (req, res) => {
    //supprime un wallet et les actifs s'y trouvant
}

exports.renameWallet = (req, res) => {
    //permet de changer la label d'un wallet
}

__max_wallet_reached = id_user => {

}