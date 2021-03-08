let express = require('express');
let router = express.Router();

let userController = require('../controllers/userController');
let assetController = require('../controllers/assetController');

// Routes Users
router.post('/user/connect', userController.connectUser);
router.post('/user/create', userController.createUser);
router.post('/user/forgotPwd', userController.forgotPwdUser);

// Routes Assets
router.get('/assets/fetchAll', assetController.fetchAllAssets);

module.exports = router;
