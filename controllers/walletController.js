const User = require('../models/userModel');
let Wallet = require('../models/walletModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");

/**
 * Allows you to retrieve the various wallets of a user
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.fetchAllWallets = (req, res) => {
    let user = new User(req.body.user_id, req.body.user_role, null, null, null, null, []);
    let mapping_types = req.body.mapping_types
    db.db.query("SELECT * FROM wallets WHERE user_id = ? ORDER BY creation_date ASC, id ASC LIMIT ?;", [user.id, user.role === "premium" ? 10 : 3], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error + '. Please contact the webmaster')
        } else {
            toolbox.fetchAllTypes().then(result => {
                resultSQL.forEach(w => {
                    user.wallet_list.push(new Wallet(w.id, mapping_types[w.type], w.label, w.creation_date, [], user.id))
                });
                res.status(200).json({ user, max_reached: req.body.max_reached, types: result, notification : req.flash().notification })
            }).catch(error => {
                res.status(500).send(error + '. Please contact the webmaster')
            });
        }
    });
}

/**
 * Creates an empty wallet if the user's limit is not reached
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.createWallet = (req, res) => {
    if(req.body.max_reached){
        res.status(403).send('You have reached your maximum number of wallets');
        return;
    }
    if(req.body.label === ""){
        res.status(400).send('The label cannot be empty');
        return;
    }
    let mapping_types = req.body.mapping_types
    let date = new Date();
    date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2)
    let wallet = new Wallet(null, req.body.type, req.body.label, date, [], req.body.user_id);
    if(wallet.type !== "Stocks" && wallet.type !== "Crypto-assets"){
        res.status(403).send('This type is not yet available');
        return;
    }
    db.db.query("INSERT INTO wallets (type, user_id, label, creation_date) VALUES (?, ?, ?, ?);", [mapping_types[wallet.type], wallet.user_id, wallet.label, date], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error + '. Please contact the webmaster')
        } else {
            res.status(200).send('Correctly added');
        }
    });
}

/**
 * Allows you to delete a wallet based on its id and its id_user
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.deleteWallet = (req, res) => {
    let wallet = new Wallet(req.params.id_wallet, null, null, null, [], req.body.user_id);
    db.db.query("DELETE FROM wallets WHERE id = ? AND user_id = ?;", [wallet.id, wallet.user_id], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error + '. Please contact the webmaster')
        } else {
            res.status(200).send('Correctly deleted');
        }
    });
}

/**
 * Allows you to rename a wallet based on its id and its id_user
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.renameWallet = (req, res) => {
    let wallet = new Wallet(req.body.wallet_id, null, req.body.label, null, [], req.body.user_id);
    if(wallet.label === ""){
        res.status(400).send('The label cannot be empty');
        return;
    }
    db.db.query("UPDATE wallets SET label = ? WHERE id = ? AND user_id = ?;", [wallet.label, wallet.id, wallet.user_id], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error + '. Please contact the webmaster')
        } else {
            res.status(200).send('Successful change of label');
        }
    });
}