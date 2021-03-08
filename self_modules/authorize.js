const jwt = require('jsonwebtoken');

module.exports = (req, res, callback) => {
    jwt.verify(req.headers.token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
        if (error) {
            res.status(403).send("Votre JWT comporte une erreur");
            return;
        } else {
            req.body.id = payload.user_id
            callback();
            return;
        }
    });
}