var whitelist = ['http://localhost:8080', 'http://example2.com']

/**
 * Put some website in a whitelist for the CORS restriction
 * 
 */
module.exports = corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      let corsOption = {origin: true}
      callback(null, corsOption)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}