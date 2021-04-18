const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");

/**
 * Allows you to retrieve all the assets in a wallet
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.fetchWalletAllAssets = (req, res) => {
    toolbox.fetchAssetsBasedOnType(req.params.id_wallet).then(assetsFromType => {
        db.db.query("SELECT DISTINCT a.ticker, a.label, aw.id_wallet, aw.id, aw.quantity, aw.invested_amount, aw.price_alert, w.type FROM assets AS a, wallets AS w, assets_wallets AS aw WHERE aw.id_wallet = ? AND aw.id_asset = a.id AND w.user_id = ? AND w.id = aw.id_wallet;", [req.params.id_wallet, req.body.user_id], (error, resultSQL) => {
            if (error) {
                res.status(500).send(error + '. Please contact the webmaster')
                return;
            } else {
                let mapping_types = req.body.mapping_types
                let newDict = {}
                if ((mapping_types[assetsFromType.type]) === "Crypto-assets") {
                    toolbox.cryptoValuesCall().then(cryptoAPI => {
                        cryptoAPI.forEach(el => {
                            newDict[el.symbol] = {
                                name: el.name,
                                ticker: el.symbol,
                                max_supply: el.max_supply,
                                total_supply: el.total_supply,
                                market_cap: el.quote.EUR.market_cap,
                                price: el.quote.EUR.price,
                                type: "Crypto-assets"
                            }
                        })
                        res.status(200).json({ resultSQL, apiInfos: newDict, assetsFromType: assetsFromType.assets, type: "Crypto-assets", id_wallet: req.params.id_wallet })
                    }).catch(error => {
                        res.status(500).send(error + '. Please contact the webmaster')
                    })
                } else if ((mapping_types[assetsFromType.type]) === "Stocks") {
                    res.status(200).json({ resultSQL, apiInfos: newDict, assetsFromType: assetsFromType.assets, type: "Stocks", id_wallet: req.params.id_wallet })
                } else {
                    res.status(204).send('Only Stocks and crypto-assets are working for the moment')
                }
            }
        });
    }).catch(error => {
        res.status(500).send(error + '. Please contact the webmaster')
    })
}

/**
 * Adds an asset to one user's wallet
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.addAsset = (req, res) => {
    if (req.body.wallet_type !== req.body.asset_type) {
        res.status(403).send('Asset type does not match wallet type')
        return;
    }
    if (req.body.quantity === '' || req.body.invested_amount === '' || isNaN(req.body.invested_amount)) {
        res.status(400).send('Please fill in all fields of the form')
        return;
    }
    if (isNaN(req.body.quantity) || isNaN(req.body.invested_amount) || req.body.quantity < 0 || req.body.invested_amount < 0) {
        res.status(400).send('The amount is invalid')
        return;
    }
    db.db.query("INSERT INTO assets_wallets (id_wallet, id_asset, quantity, invested_amount) VALUES(?,?,?,?);", [req.body.wallet_id, req.body.asset_id, req.body.quantity, req.body.invested_amount], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error + '. Please contact the webmaster')
        } else {
            res.status(201).send('Correctly added')
        }
    });
}

/**
 * Remove an asset to one user's wallet
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.removeAsset = (req, res) => {
    db.db.query("DELETE FROM assets_wallets WHERE id = ?;", [req.body.id], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error + '. Please contact the webmaster')
        } else {
            res.status(200).send('Correctly removed')
        }
    });
}

/**
 * Allows you to change the quantity owned of an asset
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.changeQtyAsset = (req, res) => {
    let assetParsed = JSON.parse(req.body.assetInfos)
    let api = undefined
    if (req.body.apiInfos != undefined) {
        api = JSON.parse(req.body.apiInfos)
    }
    if (req.body.quantity === '' || isNaN(req.body.invested_amount) || req.body.quantity <= 0) {
        res.status(400).send('The quantity is invalid')
        return;
    }
    db.db.query("UPDATE assets_wallets SET quantity = ? WHERE id = ?;", [req.body.quantity, assetParsed.id], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error + '. Please contact the webmaster')
        } else {
            assetParsed.quantity = req.body.quantity
            res.status(200).json({ api, asset: assetParsed })
        }
    });
}

/**
 * Allows you to set the alert price of an asset if the user is premium
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 * @todo this UserStory is not implemented on the website
 */
exports.setPriceAlert = (req, res) => {
    if (req.body.price_alert <= 0) {
        res.status(400).send("The amount is invalid")
        return;
    }
    let mapping_roles = req.body.mapping_roles
    db.db.query("SELECT * FROM users WHERE id = ? AND role = ?;", [req.body.user_id, mapping_roles["premium"]], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error + '. Please contact the webmaster')
        } else if (resultSQL.length) {
            res.status(403).send("This is a premium feature")
        } else {
            db.db.query("UPDATE assets_wallets SET price_alert = ? WHERE id_wallet = ? AND id_asset = ?;", [req.body.price_alert, req.body.wallet_id, req.body.asset_id], (error, resultSQL) => {
                if (error) {
                    res.status(500).send(error + '. Please contact the webmaster')
                } else {
                    res.status(200).send("Update completed")
                }
            });
        }
    });

}

/**
 * Allows you to change the invested amount of an asset
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.changeInitialInvestment = (req, res) => {
    let assetParsed = JSON.parse(req.body.assetInfos)
    let api = undefined
    if (req.body.apiInfos != undefined) {
        api = JSON.parse(req.body.apiInfos)
    }
    if (req.body.invested_amount === '' || isNaN(req.body.invested_amount) || req.body.invested_amount <= 0) {
        res.status(400).send("The amount is invalid")
        return;
    }
    db.db.query("UPDATE assets_wallets SET invested_amount = ? WHERE id = ?;", [req.body.invested_amount, assetParsed.id], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error + '. Please contact the webmaster')
        } else {
            res.status(200).send('Update completed')
        }
    })
}

/**
 * Fetch more data of an asset
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.infoAsset = (req, res) => {
    let api = undefined
    let mapping_types = req.body.mapping_types
    if (req.body.apiInfos != undefined) {
        api = JSON.parse(req.body.apiInfos)
        res.status(200).json({ api, asset: JSON.parse(req.body.assetInfos) })
    } else if (mapping_types[JSON.parse(req.body.assetInfos).type] === "Stocks") {
        toolbox.stockValuesCall(JSON.parse(req.body.assetInfos).ticker).then(result => {
            api = {
                name: JSON.parse(req.body.assetInfos).label,
                ticker: JSON.parse(req.body.assetInfos).ticker,
                max_supply: 0,
                total_supply: 0,
                market_cap: 0,
                price: result.eod[0].close || 0,
                type: "Stocks"
            }
            res.status(200).json({ api, asset: JSON.parse(req.body.assetInfos) })
        }).catch(error => {
            res.status(500).send(error + '. Please contact the webmaster')
        })
    }
}