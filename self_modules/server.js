const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes');

const port = process.env.PORT
const host = process.env.HOST

const app = express();

app.use(express.urlencoded({extended:true}));
app.use(bodyParser.json({limit:"1.1MB"}));
app.use(express.static('public'));
app.use('/', router);

exports.start = function () {
    app.listen(port, host, () => {
        console.info(`[SERVER] Listening on http://${host}:${port}`);
    })
};
