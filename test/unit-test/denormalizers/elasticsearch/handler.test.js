const assert = require('assert');
const Event = require('@danver97/event-sourcing/event');
const ESClient = require('@elastic/elasticsearch').Client;
const orderControl = require('../../../../infrastructure/denormalizers/elasticsearch/orderControl')('testdb');
const writerFunc = require('../../../../infrastructure/denormalizers/elasticsearch/writer');
const handlerFunc = require('../../../../infrastructure/denormalizers/elasticsearch/handler');
const utils = require('./utils');

let index = 'handler';
let client = null;
let writer = null;
let handler = null;

function toJSON(obj) {
    return JSON.parse(JSON.stringify(obj));
}

describe('handler unit test', function () {
    let rest;

    before(async function () {
        this.timeout(10000);
        const esParam = { url: 'http://localhost:9200', indexName: index };
        client = new utils.Client(new ESClient({ node: esParam.url }), index);
        writer = await writerFunc(esParam);
        handler = handlerFunc(writer, orderControl);
    });

    beforeEach(async () => {
        rest = utils.restaurant();
        await orderControl.db.reset();
    });
    
    afterEach(async () => {
        try {
            await client.delete(rest.restId);
        } catch (error) {
            if (error.body.result == 'not_found')
                console.log('not_found');
            else {
                console.log(error.body);
                throw error;
            }
        }
    });

    it('check if restaurantCreated event is handled properly', async function () {
        // Update done
        const e = new Event(rest.restId, 1, 'restaurantCreated', toJSON(rest));
        await handler.handleEvent(e);
        
        // Assertions
        await client.refresh();
        const res = await client.search(rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if ownerChanged event is handled properly', async function () {
        // Preset
        await client.insertOne(toJSON(rest));
        await client.refresh();
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.owner = 'newOwner';

        // Update done
        const e = new Event(rest.restId, 2, 'ownerChanged', { id: rest.restId, owner: rest.owner });
        await handler.handleEvent(e);

        // Assertions
        await client.refresh();
        const res = await client.search(rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if tableAdded event is handled properly', async function () {
        // Preset
        await client.insertOne(toJSON(rest));
        await client.refresh();
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.tables = utils.defaultTables2;

        // Update done
        const e = new Event(rest.restId, 2, 'tableAdded', { id: rest.restId, tables: toJSON(rest.tables) });
        await handler.handleEvent(e);

        // Assertions
        await client.refresh();
        const res = await client.search(rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if tableRemoved event is handled properly', async function () {
        // Preset
        await client.insertOne(toJSON(rest));
        await client.refresh();
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.tables = utils.defaultTables3;

        // Update done
        const e = new Event(rest.restId, 2, 'tableRemoved', { id: rest.restId, tables: toJSON(rest.tables) });
        await handler.handleEvent(e);

        // Assertions
        await client.refresh();
        const res = await client.search(rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if tablesChanged event is handled properly', async function () {
        // Preset
        await client.insertOne(toJSON(rest));
        await client.refresh();
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);
        
        // Update to do
        rest.tables = utils.defaultTables2;

        // Update done
        const e = new Event(rest.restId, 2, 'tablesChanged', { id: rest.restId, tables: toJSON(rest.tables) });
        await handler.handleEvent(e);

        // Assertions
        await client.refresh();
        const res = await client.search(rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if timetableChanged event is handled properly', async function () {
        // Preset
        await client.insertOne(toJSON(rest));
        await client.refresh();
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.timetable = utils.defaultTimetables2;

        // Update done
        const e = new Event(rest.restId, 2, 'timetableChanged', { id: rest.restId, timetable: toJSON(rest.timetable) });
        await handler.handleEvent(e);

        // Assertions
        await client.refresh();
        const res = await client.search(rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if menuSectionAdded event is handled properly', async function () {
        // Preset
        await client.insertOne(toJSON(rest));
        await client.refresh();
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.menu = utils.defaultMenu2;

        // Update done
        const e = new Event(rest.restId, 2, 'menuSectionAdded', { id: rest.restId, menu: toJSON(rest.menu) });
        await handler.handleEvent(e);

        // Assertions
        await client.refresh();
        const res = await client.search(rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if menuSectionRemoved event is handled properly', async function () {
        // Preset
        await client.insertOne(toJSON(rest));
        await client.refresh();
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.menu = utils.defaultMenu2;

        // Update done
        const e = new Event(rest.restId, 2, 'menuSectionRemoved', { id: rest.restId, menu: toJSON(rest.menu) });
        await handler.handleEvent(e);

        // Assertions
        await client.refresh();
        const res = await client.search(rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if dishAdded event is handled properly', async function () {
        // Preset
        await client.insertOne(toJSON(rest));
        await client.refresh();
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.menu = utils.defaultMenu2;

        // Update done
        const e = new Event(rest.restId, 2, 'dishAdded', { id: rest.restId, menu: toJSON(rest.menu) });
        await handler.handleEvent(e);

        // Assertions
        await client.refresh();
        const res = await client.search(rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if dishRemoved event is handled properly', async function () {
        // Preset
        await client.insertOne(toJSON(rest));
        await client.refresh();
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.menu = utils.defaultMenu2;

        // Update done
        const e = new Event(rest.restId, 2, 'dishRemoved', { id: rest.restId, menu: toJSON(rest.menu) });
        await handler.handleEvent(e);

        // Assertions
        await client.refresh();
        const res = await client.search(rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if dishUpdated event is handled properly', async function () {
        // Preset
        await client.insertOne(toJSON(rest));
        await client.refresh();
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update to do
        rest.menu = utils.defaultMenu2;

        // Update done
        const e = new Event(rest.restId, 2, 'dishUpdated', { id: rest.restId, menu: toJSON(rest.menu) });
        await handler.handleEvent(e);

        // Assertions
        await client.refresh();
        const res = await client.search(rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if restaurantRemoved event is handled properly', async function () {
        // Preset
        await client.insertOne(toJSON(rest));
        await client.refresh();
        await orderControl.updateLastProcessedEvent(rest.restId, 0, 1);

        // Update done
        const e = new Event(rest.restId, 2, 'restaurantRemoved', { id: rest.restId });
        await handler.handleEvent(e);

        // Assertions
        await client.refresh();
        const res = await client.search(rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, null);
    });

    after(async () => {
        await orderControl.db.reset();
    });

});
