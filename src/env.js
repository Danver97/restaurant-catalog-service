const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production')
    dotenv.load();

const ENV = {
    test: false,
    node_env: 'test',
    dburl: '',
    dbname: 'testdb',
    port: 3000,
    event_broker: 'testdb',
    event_store: 'testdb',
};

ENV.port = process.env.PORT || 3000;
ENV.node_env = process.env.NODE_ENV || 'test';
ENV.infrastructure = process.env.INFRASTRUCTURE;

ENV.event_store = process.env.EVENT_STORE || 'testbroker';
ENV.event_broker = process.env.EVENT_BROKER || 'testdb';

ENV.mongodb_url = process.env.MONGODB_URL || 'someurl';
ENV.mongodb_dbName = process.env.MONGODB_DBNAME || 'somedb';
ENV.mongodb_collection = process.env.MONGODB_COLLECTION || 'somecollection';

ENV.dbname = process.env.DB_NAME || 'testdb';
ENV.dburl = process.env.DB_URL;
ENV.test = process.env.TEST || 'true';

module.exports = ENV;
