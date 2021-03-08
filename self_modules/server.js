const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes');
const routerSecure = require('./routesSecure');
const authorize = require('./authorize');

const port = process.env.PORT
const host = process.env.HOST

const app = express();

app.use(express.urlencoded({extended:true}));
app.use(bodyParser.json({limit:"1.1MB"}));
app.use('/', router);
app.use(authorize);
app.use('/', routerSecure);

exports.start = function () {
    app.listen(port, host, () => {
        console.info(`[SERVER] Listening on http://${host}:${port}`);
    })
};
