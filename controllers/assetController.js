let Asset = require('../models/assetModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");

exports.fetchAllAssets = (req, res) => {
    //permet de récupérer tous les assets dans le base de données
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
    //récupère tous les assets d'un wallet
    // Besoin du token, et du wallet id
    db.db.query("SELECT DISTINCT a.ticker, a.label, aw.quantity, aw.unit_cost_price, aw.price_alert FROM assets AS a, wallets AS w, assets_wallets AS aw WHERE aw.id_wallet = ? AND aw.id_asset = a.id AND w.user_id = ?;", [req.params.id_wallet, req.body.user_id], (error, resultSQL) => {
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
    //ajoute un asset dans le portefeuille (parmi ceux existant en DB)
    //check s'il correspond au bon type et que ce soit bien son portefeuille
    // Mettre cette méthode en private
    db.db.query("SELECT id FROM wallets WHERE user_id = ? AND id = ?;", [req.body.user_id, req.body.wallet_id], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error)
            return;
        }
        else {
            if(resultSQL.length){
                console.log("Ce n'est pas ton portefeuille")
                return;
            }
        }
    });
    if(req.body.wallet_type !== req.body.asset_type){
        console.log("Pas le bon type")
        return;
    }
    let pru = req.body.unit_cost_price / req.body.quantity
    db.db.query("INSERT INTO assets_wallets (id_wallet, id_asset, quantity, unit_cost_price) VALUES(?,?,?,?,?);", [req.body.wallet_id, req.body.asset_id, req.body.quantity, pru], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error)
            return;
        }
        else {
            res.status(201).send("Ajout effectué")
            return;
        }
    });
}

exports.removeAsset = (req, res) => {
    //enlève un asset dans le portefeuille
    //check que ce soit bien son portefeuille
}

exports.changeQtyAsset = (req, res) => {
    //permet de modifier la quantité présente de l'asset
    //check que ce soit bien son portefeuille et que le montant est réaliste
}

exports.setPriceAlert = (req, res) => {
    //permet de placer une alerte de prix sur un asset (uniquement pour les premium)
    //check que ce soit bien son portefeuille et que le montant est réaliste
}

exports.changeInitialInvestment = (req, res) => {
    //permet de modifier le montant investit initialement afin de calculer le PRU
    //check que ce soit bien son portefeuille et que le montant est réaliste
}

__fetchTypeAssets = (type) => {
    //permet de récupérer les assets d'un certain type dans le base de données
}

__verifyWalletBelonging = (type) => {
    //permet de récupérer les assets d'un certain type dans le base de données
}