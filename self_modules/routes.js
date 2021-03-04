let express = require('express');
let router = express.Router();

let userController = require('../controllers/userController');
let walletController = require('../controllers/walletController');
let assetController = require('../controllers/assetController');

// Routes Users
router.post('/user/connect', userController.connectUser);
router.post('/user/create', userController.createUser);
router.post('/user/premium', userController.upgradeUser);
router.post('/user/forgotPwd', userController.forgotPwdUser);

// Routes Wallets
router.post('/wallets/fetch', walletController.fetchAllWallets);
router.post('/wallets/create', walletController.createWallet);
router.post('/wallets/delete', walletController.deleteWallet);
router.post('/wallets/rename', walletController.renameWallet);

// Routes Assets
router.post('/assets/fetch', assetController.fetchAllAssets);
router.post('/assets/add', assetController.addAsset);
router.post('/assets/remove', assetController.removeAsset);
router.post('/assets/changeQty', assetController.changeQtyAsset);
router.post('/assets/alert', assetController.setPriceAlert);
router.post('/assets/changeInvestment', assetController.changeInitialInvestment);

module.exports = router;
