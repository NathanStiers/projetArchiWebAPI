let express = require('express');
let router = express.Router();

let userController = require('../controllers/userController');
let walletController = require('../controllers/walletController');

router.get('/', (req, res) => {res.send("Page d'accueil")})
router.get('/wallets', (req, res) => {res.send("Page de portefeuilles")})

// Routes Users
router.post('/user/connect', userController.connectUser);
router.post('/user/create', userController.createUser);
router.get('/user/premium/:id', userController.upgradeUser);
router.post('/user/forgotPwd', userController.forgotPwdUser);

// Routes Wallets
router.get('/wallets/fetch/:user_id/:user_role', walletController.fetchAllWallets);
router.post('/wallets/create', walletController.createWallet);

// Routes Assets

module.exports = router;
