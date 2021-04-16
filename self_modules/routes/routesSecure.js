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
router.post('/user/premium', mappingRoles, userController.upgradeUser);

// Routes Wallets
router.post('/wallets/create', walletConfigurationMiddleware, walletController.createWallet);
router.post('/wallets/rename', walletController.renameWallet);
 
// Routes Assets
router.post('/assets/add', isBelongingWallet, assetController.addAsset);
router.post('/assets/remove', isBelongingWallet, assetController.removeAsset);
router.post('/assets/changeQty', isBelongingWallet, assetController.changeQtyAsset);
router.post('/assets/alert', isBelongingWallet, mappingRoles, assetController.setPriceAlert);
router.post('/assets/changeInvestment', isBelongingWallet, assetController.changeInitialInvestment);

module.exports = router;
