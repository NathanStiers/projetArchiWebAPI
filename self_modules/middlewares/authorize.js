const jwt = require('jsonwebtoken');

/**
 * Check the JWT of the user and fetch the contained data
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 * @param {Function} callback The next function
 */
module.exports = (req, res, callback) => {
    jwt.verify(req.headers.token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
        if (error) {
            res.status(500).send(error + '. Please contact the webmaster')
        } else {
            req.body.user_id = payload.user_id
            req.body.user_role = payload.user_role
            callback();
        }
    });
}