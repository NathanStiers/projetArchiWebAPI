const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const router = require('./routes/routes');
const routerSecure = require('./routes/routesSecure');
const authorize = require('./middlewares/authorize');
const corsOptions = require('./middlewares/cors');
const cookieParser = require('cookie-parser'); 

const port = process.env.PORT
const host = process.env.HOST

const app = express();

app.use(express.urlencoded({extended:true}));
app.use(bodyParser.json({limit:"1.1MB"}));
app.use(express.static('public'));
app.use(cookieParser()); 
app.use(cors(corsOptions))
app.use('/', router);
app.use(authorize);
app.use('/', routerSecure);

/**
 * Start the server
 */
exports.start = function () {
    app.listen(port, host, () => {
        console.info(`[SERVER] Listening on http://${host}:${port}`);
    })
};