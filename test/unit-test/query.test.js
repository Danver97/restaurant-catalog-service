const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const queryFunc = require('../../infrastructure/query');
const QueryError = require('../../infrastructure/query/query_error');
const utils = require('./lib/restaurant-test.lib');

const mongod = new MongoMemoryServer();
let mongodb;
let collection;

function toJSON(obj) {
    return JSON.parse(JSON.stringify(obj));
}

describe('query unit test', function () {

    before(async function () {
        this.timeout(10000);
        const connString = await mongod.getConnectionString();
        query = await queryFunc(connString, 'Restaurant', 'Restaurant');
        mongodb = new MongoClient(connString, { useNewUrlParser: true, useUnifiedTopology: true });
        await mongodb.connect();
        collection = mongodb.db('Restaurant').collection('Restaurant');
    });

    after(async () => {
        await mongod.stop();
    });

    beforeEach(async () => {
        await collection.deleteMany({});
    })

    it('check getRestaurant() works', async () => {
        const rest = utils.restaurant();
        rest._id = rest.restId;
        rest._revisionId = 1;
        await collection.insertOne(toJSON(rest));

        const doc = await query.getRestaurant(rest.restId);
        assert.deepStrictEqual(doc, rest);
    });
});
