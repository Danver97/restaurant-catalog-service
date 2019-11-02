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

describe('handler unit test', function () {
    let rest;
    let rest;
    let resToAdd;

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
        handler = handlerFunc(writer, orderControl);
    });

    

    beforeEach(async () => {
        rest = utils.restaurant();
        await orderControl.db.reset();
        await collection.deleteMany({});
    });

    it('check if restaurantCreated event is handled properly', async function () {
        // Update done
        const e = new Event(rest.restId, 1, 'restaurantCreated', rest);
        await handler(e);
        
        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, rest);
    });

    it('check if reservationAdded event is handled properly', async function () {
        // Preset
        await collection.insertOne(rest);
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.reservations.push(resToAdd);
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 2, 'reservationAdded', resToAdd);
        await handler(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, rest);
    });

    it('check if reservationRemoved event is handled properly', async function () {
        // Preset
        rest.reservations.push(resToAdd);
        rest._revisionId++;
        const newDoc = Object.assign({ _id: rest.restId, _revisionId: 2 }, rest);
        await collection.insertOne(newDoc);
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 2);

        // Update to do
        rest.reservations = rest.reservations.filter(r => r.resId !== resToAdd.resId);
        rest._revisionId++;

        // Update done
        const e = new Event(rest.restId, 3, 'reservationRemoved', { restId: rest.restId, resId: resToAdd.resId });
        await handler(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.restId });
        assert.deepStrictEqual(doc, rest);
    });

    it('check if reservationCreated event is handled properly', async function () {
        // Preset

        // Update done
        const e = new Event(rest.resId, 1, 'reservationCreated', rest);
        await handler(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.resId });
        assert.deepStrictEqual(doc, rest);
    });

    it('check if reservationConfirmed event is handled properly', async function () {
        // Preset
        const newDoc = Object.assign({ _id: rest.resId, _revisionId: 1 }, rest);
        await collection.insertOne(newDoc);
        await orderControl.updateLastProcessedEvent(rest.resId, 0, 1);
        
        // Update to do
        rest.status = 'confirmed';
        rest.table = { id: 15, people: 4 };
        rest._revisionId++;

        // Update done
        const payload = { resId: rest.resId, restId: rest.restId, table: rest.table, status: rest.status };
        const e = new Event(rest.resId, 2, 'reservationConfirmed', payload);
        await handler(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.resId });
        assert.deepStrictEqual(doc, rest);
    });

    it('check if reservationRejected event is handled properly', async function () {
        // Preset
        const newDoc = Object.assign({ _id: rest.resId, _revisionId: 1 }, rest);
        await collection.insertOne(newDoc);
        await orderControl.updateLastProcessedEvent(rest.resId, 0, 1);

        // Update to do
        rest.status = 'rejected'; // changes
        rest._revisionId++;

        // Update done
        const payload = { resId: rest.resId, restId: rest.restId, status: rest.status };
        const e = new Event(rest.resId, 2, 'reservationRejected', payload);
        await handler(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.resId });
        assert.deepStrictEqual(doc, rest);
    });


    it('check if reservationCancelled event is handled properly', async function () {
        // Preset
        rest.table = { id: 15, people: 4 };
        rest.status = 'confirmed';
        rest._revisionId++;
        const newDoc = Object.assign({ _id: rest.resId, _revisionId: 2 }, rest);
        await collection.insertOne(newDoc);
        await orderControl.updateLastProcessedEvent(rest.resId, 0, 2);

        // Update to do
        rest.status = 'cancelled' // changes
        rest._revisionId++;
        const payload = { resId: rest.resId, restId: rest.restId, status: rest.status };

        // Update done
        const e = new Event(rest.resId, 3, 'reservationCancelled', payload);
        await handler(e);

        // Assertions
        const doc = await collection.findOne({ _id: rest.resId });
        assert.deepStrictEqual(doc, rest);
    });

    after(async () => {
        await mongod.stop();
        await orderControl.db.reset();
    });

});
