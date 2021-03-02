let express = require('express');
let router = express.Router();

let taskController = require('../controllers/userController');

router.get('/', (req, res) => {res.send("Page d'accueil")})
router.get('/wallets', (req, res) => {res.send("Page de portefeuilles")})
router.post('/user/fetch', taskController.fetchUser);
router.post('/user/create', taskController.createUser);

module.exports = router;
