const assert = require('assert');
const uuid = require('uuid/v4');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const MongoClient = require('mongodb').MongoClient;
const Event = require('@danver97/event-sourcing/event');
const writerFunc = require('../../../../infrastructure/denormalizers/mongodb/writer');
const utils = require('./utils');

const mongod = new MongoMemoryServer();
let client = null;
let collection = null;
let writer = null;

function toJSON(obj) {
    return JSON.parse(JSON.stringify(obj));
}

describe('writer unit test', function () {
    let rest;

    before(async function () {
        this.timeout(10000);
        const mongoConfig = {
            url: await mongod.getConnectionString(),
            db: 'Reservation',
            collection: 'Reservation',
        };
        client = new MongoClient(mongoConfig.url, { useNewUrlParser: true });
        await client.connect();
        collection = client.db(mongoConfig.db).collection(mongoConfig.collection);
        writer = await writerFunc(mongoConfig);
    });

    beforeEach(() => {
        rest = utils.restaurant();
        return collection.deleteMany({});
    });

    it('check if restarantCreated works', async function () {
        const e = new Event(rest.restId, 1, 'restaurantCreated', toJSON(rest));
        await writer.restaurantCreated(e.payload);

        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if tableAdded works', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));
        
        // Update to do
        rest.tables = utils.defaultTables2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'tableAdded', { id: rest.restId, tables: toJSON(rest.tables) });
        await writer.tableAdded(rest.restId, e.eventId - 1, e.payload.tables);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if tableRemoved works', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));
        
        // Update to do
        rest.tables = utils.defaultTables3;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'tableRemoved', { id: rest.restId, tables: toJSON(rest.tables) });
        await writer.tableRemoved(rest.restId, e.eventId - 1, e.payload.tables);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if tablesChanged works', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));

        // Update to do
        rest.tables = utils.defaultTables2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'tablesChanged', { id: rest.restId, tables: toJSON(rest.tables) });
        await writer.tablesChanged(rest.restId, e.eventId - 1, e.payload.tables);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if timetableChanged works', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));
        
        // Update to do
        rest.timetable = utils.defaultTimetables2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'timetableChanged', { id: rest.restId, timetable: toJSON(rest.timetable) });
        await writer.timetableChanged(rest.restId, e.eventId - 1, e.payload.timetable);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if menuSectionAdded works', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));

        // Update to do
        rest.menu = utils.defaultMenu2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'menuSectionAdded', { id: rest.restId, menu: toJSON(rest.menu) });
        await writer.menuSectionAdded(rest.restId, e.eventId - 1, e.payload.menu);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if menuSectionRemoved works', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));

        // Update to do
        rest.menu = utils.defaultMenu2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'menuSectionRemoved', { id: rest.restId, menu: toJSON(rest.menu) });
        await writer.menuSectionRemoved(rest.restId, e.eventId - 1, e.payload.menu);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if dishAdded works', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));

        // Update to do
        rest.menu = utils.defaultMenu2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'dishAdded', { id: rest.restId, menu: toJSON(rest.menu) });
        await writer.dishAdded(rest.restId, e.eventId - 1, e.payload.menu);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if dishRemoved works', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));

        // Update to do
        rest.menu = utils.defaultMenu2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'dishRemoved', { id: rest.restId, menu: toJSON(rest.menu) });
        await writer.dishRemoved(rest.restId, e.eventId - 1, e.payload.menu);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if dishUpdated works', async function () {
        // Preset
        await collection.insertOne(toJSON(rest));

        // Update to do
        rest.menu = utils.defaultMenu2;
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'dishUpdated', { id: rest.restId, menu: toJSON(rest.menu) });
        await writer.dishUpdated(rest.restId, e.eventId - 1, e.payload.menu);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    after(async () => {
        await client.close();
        await mongod.stop();
    });

});
