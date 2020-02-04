const assert = require('assert');
const Event = require('@danver97/event-sourcing/event');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const MongoClient = require('mongodb').MongoClient;
const orderControl = require('../../../../infrastructure/denormalizers/mongodb/orderControl')('testdb');
const writerFunc = require('../../../../infrastructure/denormalizers/mongodb/writer');
const handlerFunc = require('../../../../infrastructure/denormalizers/mongodb/handler');
const utils = require('./utils');

const mongod = new MongoMemoryServer();
let client = null;
let collection = null;
let writer = null;
let handler = null;

function toJSON(obj) {
    return JSON.parse(JSON.stringify(obj));
}

describe('handler unit test', function () {
    let rest;

    before(async function () {
        this.timeout(10000);
        const mongoConfig = {
            url: await mongod.getConnectionString(),
            db: 'Reservation',
            collection: 'Reservation',
        };
        client = new MongoClient(mongoConfig.url, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        collection = client.db(mongoConfig.db).collection(mongoConfig.collection);
        writer = await writerFunc(mongoConfig);
        handler = handlerFunc(writer, orderControl);
    });

    beforeEach(async () => {
        rest = utils.restaurant();
        await orderControl.db.reset();
        await collection.deleteMany({});
    });

    it('check if restaurantCreated event is handled properly', async function () {
        // Update done
        const e = new Event(rest.restId, 1, 'restaurantCreated', toJSON(rest));
        await handler.handleEvent(e);
        
        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if ownerChanged event is handled properly', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.owner = 'newOwner';
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'ownerChanged', { id: rest.restId, owner: rest.owner });
        await handler.handleEvent(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if tableAdded event is handled properly', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.tables = utils.defaultTables2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'tableAdded', { id: rest.restId, tables: toJSON(rest.tables) });
        await handler.handleEvent(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if tableRemoved event is handled properly', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.tables = utils.defaultTables3;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'tableRemoved', { id: rest.restId, tables: toJSON(rest.tables) });
        await handler.handleEvent(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if tablesChanged event is handled properly', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);
        
        // Update to do
        rest.tables = utils.defaultTables2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'tablesChanged', { id: rest.restId, tables: toJSON(rest.tables) });
        await handler.handleEvent(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if timetableChanged event is handled properly', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.timetable = utils.defaultTimetables2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'timetableChanged', { id: rest.restId, timetable: toJSON(rest.timetable) });
        await handler.handleEvent(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if menuSectionAdded event is handled properly', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.menu = utils.defaultMenu2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'menuSectionAdded', { id: rest.restId, menu: toJSON(rest.menu) });
        await handler.handleEvent(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if menuSectionRemoved event is handled properly', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.menu = utils.defaultMenu2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'menuSectionRemoved', { id: rest.restId, menu: toJSON(rest.menu) });
        await handler.handleEvent(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if dishAdded event is handled properly', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.menu = utils.defaultMenu2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'dishAdded', { id: rest.restId, menu: toJSON(rest.menu) });
        await handler.handleEvent(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if dishRemoved event is handled properly', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.menu = utils.defaultMenu2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'dishRemoved', { id: rest.restId, menu: toJSON(rest.menu) });
        await handler.handleEvent(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if dishUpdated event is handled properly', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.menu = utils.defaultMenu2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'dishUpdated', { id: rest.restId, menu: toJSON(rest.menu) });
        await handler.handleEvent(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if locationChanged event is handled properly', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.location = utils.defaultLocation;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'locationChanged', { id: rest.restId, location: toJSON(rest.location) });
        await handler.handleEvent(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if restaurantRemoved event is handled properly', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update done
        const e = new Event(rest.restId, 2, 'restaurantRemoved', { id: rest.restId });
        await handler.handleEvent(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, null);
    });

    after(async () => {
        await mongod.stop();
        await orderControl.db.reset();
    });

});
