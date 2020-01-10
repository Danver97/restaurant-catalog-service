const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const ESClient = require('@elastic/elasticsearch').Client;
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const queryFunc = require('../../infrastructure/query');
const QueryError = require('../../infrastructure/query/query_error');
const utils = require('./lib/restaurant-test.lib');

const mongod = new MongoMemoryServer();
let mongodb;
let collection;
let esClient;
let esIndex = 'query_manager';

function toJSON(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function createIndexWithGeoMapping(propertyName) {
    return esClient.indices.create({
        index: esIndex,
        body: {
            mappings: {
                properties: {
                    [propertyName]: {
                        type: "geo_point"
                    }
                }
            }
        }
    });
}

describe('query unit test', function () {
    let currentRestId;

    before(async function () {
        this.timeout(10000);
        const connString = await mongod.getConnectionString();
        const mongoOptions = { connString, dbName: 'Restaurant', collectionName: 'Restaurant' };
        const esOptions = { url: 'http://localhost:9200', index: esIndex };
        query = await queryFunc(mongoOptions, esOptions);
        esClient = new ESClient({ node: esOptions.url });
        try {
            await createIndexWithGeoMapping('location.coordinates');
        } catch (e) {
            if (e.body.error.type !== 'resource_already_exists_exception') {
                console.log(e.body)
                throw e;
            }
        }
        mongodb = new MongoClient(connString, { useNewUrlParser: true, useUnifiedTopology: true });
        await mongodb.connect();
        collection = mongodb.db('Restaurant').collection('Restaurant');
    });

    after(async () => {
        await mongod.stop();
    });

    afterEachVerbose = false;
    afterEach(async () => {
        await collection.deleteMany({});
        await esClient.indices.refresh({ index: esIndex });
        try {
            await esClient.delete({ index: esIndex, id: currentRestId });
        } catch (e) {
            if (e.body.result === 'not_found') { if (afterEachVerbose) console.log('es doc not found'); }
            else throw e;
        }
        await esClient.indices.refresh({ index: esIndex });
    });

    it('check getRestaurant() works', async () => {
        assert.throws(() => query.getRestaurant(), QueryError);

        const rest = utils.restaurant();
        currentRestId = rest.restId;
        rest._id = rest.restId;
        rest._revisionId = 1;
        await collection.insertOne(toJSON(rest));

        const doc = await query.getRestaurant(rest.restId);
        assert.deepStrictEqual(doc, rest);
    });

    it('check nearme() works', async () => {
        assert.throws(() => query.nearme(), QueryError);
        assert.throws(() => query.nearme({}), QueryError);
        assert.throws(() => query.nearme({ distance: 3 }), QueryError);
        assert.throws(() => query.nearme({ distance: 3, coordinates: { lat: 3 } }), QueryError);
        assert.throws(() => query.nearme({ distance: 3, coordinates: { lon: 3 } }), QueryError);

        const rest = utils.restaurant();
        currentRestId = rest.restId;
        rest.setLocation(utils.defaultLocation);
        await esClient.index({
            index: esIndex,
            id: rest.restId,
            body: toJSON(rest),
        });
        await esClient.indices.refresh({ index: esIndex });

        const options = {
            distance: 500,
            coordinates: {
                lat: 44.021651,
                lon: 7.021651,
            },
        };
        const docs = await query.nearme(options);
        assert.deepStrictEqual(docs[0], rest);
    });
});
