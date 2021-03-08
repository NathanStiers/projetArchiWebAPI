let Asset = require('../models/assetModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");

exports.fetchAllAssets = () => {
    //permet de récupérer tous les assets dans le base de données
}

exports.fetchWalletAllAssets = (req, res) => {
    //récupère tous les assets d'un wallet
}

exports.addAsset = (req, res) => {
    //ajoute un asset dans le portefeuille (parmi ceux existant en DB)
}

exports.removeAsset = (req, res) => {
    //enlève un asset dans le portefeuille
}

exports.changeQtyAsset = (req, res) => {
    //permet de modifier la quantité présente de l'asset
}

exports.setPriceAlert = (req, res) => {
    //permet de placer une alerte de prix sur un asset (uniquement pour les premium)
}

exports.changeInitialInvestment = (req, res) => {
    //permet de modifier le montant investit initialement afin de calculer le PRU
}

__fetchTypeAssets = (type) => {
    //permet de récupérer les assets d'un certain type dans le base de données
}