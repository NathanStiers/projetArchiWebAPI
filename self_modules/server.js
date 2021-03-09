const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const router = require('./routes');
const routerSecure = require('./routesSecure');
const authorize = require('./authorize');

const port = process.env.PORT
const host = process.env.HOST

const app = express();

var whitelist = ['http://localhost:8080', 'http://example2.com']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(express.urlencoded({extended:true}));
app.use(bodyParser.json({limit:"1.1MB"}));
app.use(cors(corsOptions))
app.use('/', router);
app.use(authorize);
app.use('/', routerSecure);

exports.start = function () {
    app.listen(port, host, () => {
        console.info(`[SERVER] Listening on http://${host}:${port}`);
    })
};
