const assert = require('assert');
const Event = require('@danver97/event-sourcing/event');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const MongoClient = require('mongodb').MongoClient;
const handlerFunc = require('../handler/event_handlers');
const mongoConfigFunc = require('../projection/mongodb');

const mongod = new MongoMemoryServer();
let client = null;
let collection = null;
let projection = null;
let handler = null;

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
};

function logEvent(e) {
    if (false)
        console.log(e);
}

describe('Event Handler unit test', function () {
    const restaurant = {
        restId: '1',
        owner: 'John',
        timeTable,
        tables: [],
    };

    before(async () => {
        const connString = await mongod.getConnectionString();
        client = new MongoClient(connString);
        await client.connect();
        collection = client.db('Restaurant').collection('Restaurant');
        projection = await mongoConfigFunc(connString, 'Restaurant');
        handler = handlerFunc(projection);
    });

    it('check if restaurantCreated event is handled properly', async function () {
        const e = new Event(restaurant.restId, 1, 'restaurantCreated', restaurant);
        const ack = () => logEvent(e);
        await handler(e, ack);
        const doc = await collection.findOne({ _id: restaurant.restId });
        assert.deepStrictEqual(doc, restaurant);
    });

    it('check if ownerChanged event is handled properly', async function () {
        restaurant.owner = 'Jessy';
        restaurant._revisionId++;
        const e = new Event(restaurant.restId, 2, 'ownerChanged', { owner: restaurant.owner });
        const ack = () => logEvent(e);
        await handler(e, ack);
        const doc = await collection.findOne({ _id: restaurant.restId });
        assert.deepStrictEqual(doc, restaurant);
    });

    it('check if tables* event is handled properly', async function () {
        restaurant.tables = [{ f: '1' }];
        restaurant._revisionId++;
        const e = new Event(restaurant.restId, 3, 'tablesAdded', { tables: restaurant.tables });
        const ack = () => logEvent(e);
        await handler(e, ack);
        const doc = await collection.findOne({ _id: restaurant.restId });
        assert.deepStrictEqual(doc, restaurant);
    });

    after(() => {
        mongod.stop();
    })

});
