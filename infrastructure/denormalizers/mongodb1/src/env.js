const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production')
    dotenv.load();

module.exports = process.env;
