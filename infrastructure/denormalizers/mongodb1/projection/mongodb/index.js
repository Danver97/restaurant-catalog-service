const mongodb = require('mongodb');
const projectionFunc = require('./projector');


async function exportFunc(urlString, dbName) {
    const url = urlString || process.env.MONGODB_URL;
    const client = new mongodb.MongoClient(url);
    await client.connect();
    const db = client.db(dbName || process.env.MICROSERVICE_NAME);
    const projection = await projectionFunc(db);
    return projection;
}

module.exports = exportFunc;
