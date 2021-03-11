let Asset = require('../models/assetModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");

exports.fetchAllAssets = (req, res) => {
    db.db.query("SELECT * FROM assets;", (error, resultSQL) => {
        if (error) {
            res.status(500).send(error)
            return;
        }
        else {
            resultSQL.forEach(r => {
                delete r.id
            });
            res.status(200).json(resultSQL)
            return;
        }
    });
}


exports.fetchWalletAllAssets = (req, res) => {
    db.db.query("SELECT DISTINCT a.ticker, a.label, aw.quantity, aw.invested_amount, aw.price_alert FROM assets AS a, wallets AS w, assets_wallets AS aw WHERE aw.id_wallet = ? AND aw.id_asset = a.id AND w.user_id = ?;", [req.params.id_wallet, req.body.user_id], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error)
            return;
        }
        else {
            res.status(200).json(resultSQL)
            return;
        }
    });
}

exports.addAsset = (req, res) => {
    __verifyWalletBelonging(req.body.user_id, req.body.wallet_id).then(isBelonging => {
        if(!isBelonging){
            res.status(403).send("Ce portefeuille n'appartient pas à cet utilisateur")
            return;
        }
        if(req.body.wallet_type !== req.body.asset_type){
            res.status(403).send("Le type de l'asset ne correspond pas à celui du portefeuille")
            return;
        }
        db.db.query("INSERT INTO assets_wallets (id_wallet, id_asset, quantity, invested_amount) VALUES(?,?,?,?,?);", [req.body.wallet_id, req.body.asset_id, req.body.quantity, req.body.invested_amount], (error, resultSQL) => {
            if (error) {
                res.status(500).send(error)
                return;
            }
            else {
                res.status(201).send("Ajout effectué")
                return;
            }
        });
    }).catch(err => {
        res.status(500).send(err);
        return;
    })
}

exports.removeAsset = (req, res) => {
    __verifyWalletBelonging(req.body.user_id, req.body.wallet_id).then(isBelonging => {
        if(!isBelonging){
            res.status(403).send("Ce portefeuille n'appartient pas à cet utilisateur")
            return;
        }
        db.db.query("DELETE FROM assets_wallets WHERE id_wallet = ? AND id_asset = ?;", [req.body.wallet_id, req.body.asset_id], (error, resultSQL) => {
            if (error) {
                res.status(500).send(error)
                return;
            }
            else {
                res.status(200).send("Suppression effectuée")
                return;
            }
        });
    }).catch(err => {
        res.status(500).send(err);
        return;
    })
}

exports.changeQtyAsset = (req, res) => {
    __verifyWalletBelonging(req.body.user_id, req.body.wallet_id).then(isBelonging => {
        if(!isBelonging){
            res.status(403).send("Ce portefeuille n'appartient pas à cet utilisateur")
            return;
        }
        if(req.body.quantity <= 0){
            res.status(403).send("Les montants négatifs sont impossibles")
            return;
        }
        db.db.query("UPDATE assets_wallets SET quantity = ? WHERE id_wallet = ? AND id_asset = ?;", [req.body.quantity, req.body.wallet_id, req.body.asset_id], (error, resultSQL) => {
            if (error) {
                res.status(500).send(error)
                return;
            }
            else {
                res.status(200).send("Mise à jour effectuée")
                return;
            }
        });
    }).catch(err => {
        res.status(500).send(err);
        return;
    })
}

exports.setPriceAlert = (req, res) => {
    //permet de placer une alerte de prix sur un asset (uniquement pour les premium)
    __verifyWalletBelonging(req.body.user_id, req.body.wallet_id).then(isBelonging => {
        if(!isBelonging){
            res.status(403).send("Ce portefeuille n'appartient pas à cet utilisateur")
            return;
        }
        if(req.body.price_alert <= 0){
            res.status(403).send("Les montants négatifs sont impossibles")
            return;
        }
        db.db.query("UPDATE assets_wallets SET price_alert = ? WHERE id_wallet = ? AND id_asset = ?;", [req.body.price_alert, req.body.wallet_id, req.body.asset_id], (error, resultSQL) => {
            if (error) {
                res.status(500).send(error)
                return;
            }
            else {
                res.status(200).send("Mise à jour effectuée")
                return;
            }
        });
    }).catch(err => {
        res.status(500).send(err);
        return;
    })
}

exports.changeInitialInvestment = (req, res) => {
    __verifyWalletBelonging(req.body.user_id, req.body.wallet_id).then(isBelonging => {
        if(!isBelonging){
            res.status(403).send("Ce portefeuille n'appartient pas à cet utilisateur")
            return;
        }
        if(req.body.invested_amount <= 0){
            res.status(403).send("Les montants négatifs sont impossibles")
            return;
        }
        toolbox.mapping_label_id_roles().then(mapping => {
            db.db.query("SELECT * FROM users WHERE id = ? AND role = ?;", [req.body.user_id, mapping["premium"]], (error, resultSQL) => {
                if (error) {
                    res.status(500).send(error)
                    return;
                } else if(resultSQL.length){
                    res.status(403).send("Il s'agit d'une fonctionnalité premium")
                    return;
                } else {
                    db.db.query("UPDATE assets_wallets SET invested_amount = ? WHERE id_wallet = ? AND id_asset = ?;", [req.body.invested_amount, req.body.wallet_id, req.body.asset_id], (error, resultSQL) => {
                        if (error) {
                            res.status(500).send(error)
                            return;
                        }
                        else {
                            res.status(200).send("Mise à jour effectuée")
                            return;
                        }
                    });
                }
            });
        }).catch(err => {
            res.status(500).send(err);
            return;
        })
        }).catch(err => {
            res.status(500).send(err);
            return;
        })
        
}

__fetchTypeAssets = (type) => {
    //permet de récupérer les assets d'un certain type dans le base de données
}

// PRIVATE ==> Permet de vérifier qu'un portefeuille appartient à l'utilisateur
__verifyWalletBelonging = (user_id, wallet_id) => {
    return new Promise((resolve, reject) => {
        db.db.query("SELECT id FROM wallets WHERE user_id = ? AND id = ?;", [user_id, wallet_id], (error, resultSQL) => {
            if (error) {
                reject(500)
                return;
            }
            else {
                if(resultSQL.length){
                    resolve(false)
                    return;
                }else{
                    resolve(true)
                    return;
                }
            }
        });
    });
}