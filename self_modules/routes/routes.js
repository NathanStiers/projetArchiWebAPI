let express = require('express');
let router = express.Router();
const toolbox = require("../toolbox");

let userController = require('../../controllers/userController');
let assetController = require('../../controllers/assetController');

// Routes Users
router.post('/user/connect', userController.connectUser);
router.post('/user/create', userController.createUser);
router.post('/user/forgotPwd', userController.forgotPwdUser);

// Routes Assets
router.get('/assets/fetchAll', assetController.fetchAllAssets);

// Routes Misc
router.get('/misc/fetchAllTypes', toolbox.fetchAllTypes);
router.get('/misc/fetchAssetsFromType/:id', toolbox.fetchAssetsFromType)

module.exports = router;
