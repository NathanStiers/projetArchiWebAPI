let Wallet = require('../models/walletModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");

exports.fetchAllWallets = (req, res) => {
    //récupère tous les wallets d'un user
}

exports.createWallet = (req, res) => {
    //crée un wallet vide
}

exports.deleteWallet = (req, res) => {
    //supprime un wallet et les actifs s'y trouvant
}

exports.renameWallet = (req, res) => {
    //permet de changer la label d'un wallet
}