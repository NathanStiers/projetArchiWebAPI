let express = require('express');
let router = express.Router();

const fetchUserByMail = require('../middlewares/fetchUserByMail')
const mappingRoles = require('../middlewares/mappingRoles')

let userController = require('../../controllers/userController');

const userConfigurationMiddleware = [mappingRoles, fetchUserByMail]

// Routes Users
router.post('/user/connect', userConfigurationMiddleware, userController.connectUser);
router.post('/user/create', mappingRoles, userController.createUser);
router.post('/user/forgotPwd', userConfigurationMiddleware, userController.forgotPwdUser);

module.exports = router;