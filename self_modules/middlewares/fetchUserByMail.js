const db = require('../db');
const toolbox = require('../toolbox')

/**
 * Fetch the data of a user based on his mail
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 * @param {Function} callback The next function
 */
module.exports = (req, res, callback) => {
    let mail = req.body.mail
    if (!toolbox.checkMail(mail)) {
        res.status(400).send('The mail doesn\'t use a correct format');
    } else {
        db.db.query("SELECT * FROM users WHERE mail = ?;", mail, (error, resultSQL) => {
            if (error) {
                res.status(500).send(error.sqlMessage + '. Please contact the webmaster')
            } else {
                if (resultSQL.length === 0) {
                    res.status(404).send('This user does not exist');
                } else {
                    let mapping_roles = req.body.mapping_roles
                    resultSQL[0].role = mapping_roles[resultSQL[0].role]
                    req.body.user = resultSQL[0]
                    callback()
                }
            }
        });
    }
}