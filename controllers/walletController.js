let Wallet = require('../models/walletModel');
let User = require('../models/userModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");

let mapping_label_id_types = {};
let mapping_label_id_roles = {};

// Permet de récupérer les différents portefeuilles d'un utilisateur
// Method : POST 
// Body : user_id
exports.fetchAllWallets = (req, res) => {
    __fetchUserById(req.user_id).then(result => {
        let user = result;
        toolbox.mapping_label_id_types().then(result => {
            mapping_label_id_types = result;
            db.db.query("SELECT * FROM wallets WHERE user_id = ? ORDER BY creation_date ASC, id ASC LIMIT ?;", [user.id, user.role === "premium" ? 10 : 3], (error, resultSQL) => {
                if (error) {
                    res.status(500).send(error);
                    return;
                }
                else {
                    resultSQL.forEach(w => {
                        user.wallet_list.push(new Wallet(w.id, mapping_label_id_types[w.type], w.label, w.creation_date, [], user.id))
                    });
                    res.status(200).json(user);
                    return;
                }
            });
        }).catch(error => {
            res.status(500).send(error);
            return;
        });
    }).catch(error => {
        res.status(500).send(error);
        return;
    })
    
}

// Permet de créer un portefeuille vide si la limite de l'utilisateur n'est pas atteinte
// Method : POST 
// Body : user_id, type, label
exports.createWallet = (req, res) => {
    __max_wallet_reached(req.body.user_id).then(result => {
        if (result) {
            res.status(403).send("Vous avez atteint votre limite de création de portefeuilles");
            return;
        } else {
            toolbox.mapping_label_id_types().then(result => {
                mapping_label_id_types = result
                let date = new Date();
                date = date.getUTCFullYear() + '-' +
                    ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
                    ('00' + date.getUTCDate()).slice(-2)
                let wallet = new Wallet(null, req.body.type, req.body.label, date, [], req.body.user_id);
                console.log(wallet.type)
                db.db.query("INSERT INTO wallets (type, user_id, label, creation_date) VALUES (?, ?, ?, ?);", [mapping_label_id_types[wallet.type], wallet.user_id, wallet.label, date], (error, resultSQL) => {
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
            }).catch(error => {
                console.log(error)
                res.status(500).send(error);
                return;
            });
        }
    }).catch(error => {
        res.status(500).send(error);
        return;
    })
}

// Permet de supprimer un portefeuille sur base de son id et de son id_user
// Method : POST 
// Body : id, user_id
exports.deleteWallet = (req, res) => {
    let wallet = new Wallet(req.body.id, null, null, null, [], req.body.user_id);
    db.db.query("DELETE FROM wallets WHERE id = ? AND user_id = ?;", [wallet.id, wallet.user_id], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error);
            return;
        }
        else {
            res.status(200).send("Suppression réalisée")
            return;
        }
    });
}

// Permet de renommer un portefeuille sur base de son id et de son id_user
// Method : POST 
// Body : id, user_id, label
exports.renameWallet = (req, res) => {
    let wallet = new Wallet(req.body.id, null, req.body.label, null, [], req.body.user_id);
    db.db.query("UPDATE wallets SET label = ? WHERE id = ? AND user_id = ?;", [wallet.label, wallet.id, wallet.user_id], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error);
            return;
        }
        else {
            res.status(200).send("Modification effectuée")
            return;
        }
    });
}

// PRIVATE ==> Permet de vérifier si un utilisateur a atteint sa limite de création de portefeuilles sur base de son id
__max_wallet_reached = id_user => {
    return new Promise((resolve, reject) => {
        db.db.query("SELECT role FROM users WHERE id = ?;", id_user, (error, resultSQLUser) => {
            if (error) {
                reject(error);
                return;
            }
            else {
                db.db.query("SELECT COUNT(id) AS count FROM wallets WHERE user_id = ?;", id_user, (error, resultSQLCount) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    else {
                        toolbox.mapping_label_id_roles().then(result => {
                            mapping_label_id_roles = result
                            let count = resultSQLCount[0].count;
                            let role = mapping_label_id_roles[resultSQLUser[0].role];
                            resolve(count >= 3 && role === "basic") || (count >= 10 && role === "premium")
                            return;
                        }).catch(error => {
                            reject(error);
                            return;
                        })
                    }
                });
            }
        });
    });
}
