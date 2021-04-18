let express = require('express');
let router = express.Router();

let userController = require('../../controllers/userController');
let walletController = require('../../controllers/walletController');
let assetController = require('../../controllers/assetController');

const isBelongingWallet = require('../middlewares/isBelongingWallet')
const maxWalletReached = require('../middlewares/maxWalletReached')
const mappingRoles = require('../middlewares/mappingRoles')
const mappingTypes = require('../middlewares/mappingTypes')

const walletConfigurationMiddleware = [maxWalletReached, mappingTypes]

// Routes Users
router.get('/user/premium', mappingRoles, userController.upgradeUser);
router.get('/statistics', mappingTypes, userController.statisticsResults);

// Routes Wallets
router.get('/wallets/fetch', walletConfigurationMiddleware, walletController.fetchAllWallets);
router.post('/wallets/create', walletConfigurationMiddleware, walletController.createWallet);
router.post('/wallets/delete', walletConfigurationMiddleware, walletController.deleteWallet);
router.post('/wallets/rename', isBelongingWallet, walletController.renameWallet);
 
// Routes Assets
router.get('/wallets/:id_wallet', mappingTypes, assetController.fetchWalletAllAssets);
router.post('/assets/add', isBelongingWallet, assetController.addAsset);
router.post('/assets/remove', isBelongingWallet, assetController.removeAsset);
router.post('/assets/changeQty', isBelongingWallet, assetController.changeQtyAsset);
router.post('/assets/alert', isBelongingWallet, mappingRoles, assetController.setPriceAlert);
router.post('/assets/changeInvestment', isBelongingWallet, assetController.changeInitialInvestment);

module.exports = router;
