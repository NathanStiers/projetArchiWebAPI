let express = require('express');
let router = express.Router();

let userController = require('../controllers/userController');

router.get('/', (req, res) => {res.send("Page d'accueil")})
router.get('/wallets', (req, res) => {res.send("Page de portefeuilles")})

// Routes Users
router.post('/user/connect', userController.connectUser);
router.post('/user/create', userController.createUser);
router.get('/user/premium/:id', userController.upgradeUser);

// Routes Wallets

// Routes Assets

module.exports = router;
