const assert = require('assert');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const MongoClient = require('mongodb').MongoClient;
const Event = require('@danver97/event-sourcing/event');
const mongoConfigFunc = require('../projection/mongodb');

const mongod = new MongoMemoryServer();
let client = null;
let collection = null;
let projection = null;

const tipicalDay = {
    morning: {
        open: '10:00',
        close: '14:00',
    },
    afternoon: {
        open: '18:00',
        close: '23:00',
    }
};
const timeTable = {
    Monday: 'closed',
    Tuesday: 'closed',
    Wednesday: tipicalDay,
    Thursday: tipicalDay,
    Friday: tipicalDay,
    Saturday: tipicalDay,
    Sunday: tipicalDay,
}

describe('MongoDB projector unit test', function () {
    const streamId = '1';
    const restaurant = {
        restId: streamId,
        owner: 'John',
        timeTable,
        tables: [],
    };
    restaurant._id = restaurant.restId;
    restaurant._revisionId = 1;

    before(async () => {
        const connString = await mongod.getConnectionString();
        client = new MongoClient(connString);
        await client.connect();
        collection = client.db('Restaurant').collection('Restaurant');
        projection = await mongoConfigFunc(connString, 'Restaurant');
    });

    it('check if restaurantCreated works', async function () {
        const e = new Event(streamId, 1, 'restaurantCreated', restaurant);
        await projection.restaurantCreated(e.payload);
        const doc = await collection.findOne({ _id: restaurant.restId });
        assert.deepStrictEqual(doc, restaurant);
    });

    it('check if ownerChanged works', async function () {
        restaurant.owner = 'Jessy';
        restaurant._revisionId++;
        const e = new Event(streamId, 2, 'ownerChanged', { owner: restaurant.owner });
        await projection.ownerChanged(restaurant.restId, e.eventId - 1, restaurant.owner);
        const doc = await collection.findOne({ _id: restaurant.restId });
        assert.deepStrictEqual(doc, restaurant);
    });

    it('check if tablesChanged works', async function () {
        restaurant.tables = [{ f: '1' }];
        restaurant._revisionId++;
        const e = new Event(streamId, 3, 'tablesChanged', { tables: restaurant.tables });
        await projection.tablesAdded(restaurant.restId, e.eventId - 1, restaurant.tables);
        const doc = await collection.findOne({ _id: restaurant.restId });
        assert.deepStrictEqual(doc, restaurant);
    });

    after(async () => {
        await client.close();
        await mongod.stop();
    });

});
