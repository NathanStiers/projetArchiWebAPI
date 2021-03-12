let express = require('express');
let router = express.Router();

let userController = require('../../controllers/userController');
let walletController = require('../../controllers/walletController');
let assetController = require('../../controllers/assetController');

const isBelongingWallet = require('../middlewares/isBelongingWallet')
const maxWalletReached = require('../middlewares/maxWalletReached')

// Routes Users
router.post('/user/premium', userController.upgradeUser);

// Routes Wallets
router.post('/wallets/fetch', walletController.fetchAllWallets);
router.post('/wallets/create', maxWalletReached, walletController.createWallet);
router.post('/wallets/delete', walletController.deleteWallet);
router.post('/wallets/rename', walletController.renameWallet);

// Routes Assets
router.post('/assets/:id_wallet/fetch', assetController.fetchWalletAllAssets);
router.post('/assets/add', isBelongingWallet, assetController.addAsset);
router.post('/assets/remove', isBelongingWallet, assetController.removeAsset);
router.post('/assets/changeQty', isBelongingWallet, assetController.changeQtyAsset);
router.post('/assets/alert', isBelongingWallet, assetController.setPriceAlert);
router.post('/assets/changeInvestment', isBelongingWallet, assetController.changeInitialInvestment);

module.exports = router;
