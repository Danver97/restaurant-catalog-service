const assert = require('assert');
const uuid = require('uuid/v4');
const ESClient = require('@elastic/elasticsearch').Client;
const Event = require('@danver97/event-sourcing/event');
const writerFunc = require('../../../../infrastructure/denormalizers/elasticsearch/writer');
const utils = require('./utils');

let index = 'prova_writer';
let client = null;
let writer = null;

function toJSON(obj) {
    return JSON.parse(JSON.stringify(obj));
}

describe('writer unit test', function () {
    let rest;

    before(async function () {
        this.timeout(10000);
        const esParam = { url: 'http://localhost:9200', indexName: index };
        client = new ESClient({ node: esParam.url });
        writer = await writerFunc(esParam);
    });

    beforeEach(async () => {        
        rest = utils.restaurant();
        //await client.indices.refresh({ index });
    });

    afterEach(async () => {
        try {
            await client.delete({ index, id: rest.restId });
        } catch (error) {
            if (error.body.result == 'not_found')
                console.log('not_found');
            else {
                console.log(error.body);
                throw error;
            }
        }
    });

    it('check if restarantCreated works', async function () {
        const e = new Event(rest.restId, 1, 'restaurantCreated', toJSON(rest));
        await writer.restaurantCreated(e.payload);

        // Assertions
        await utils.refresh(client, index);
        const res = await utils.search(client, index, rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if tableAdded works', async function () {
        // Preset
        await utils.insertOne(client, index, toJSON(rest));
        await utils.refresh(client, index);
        
        // Update to do
        rest.tables = utils.defaultTables2;

        // Update done
        const e = new Event(rest.restId, 2, 'tableAdded', { id: rest.restId, tables: toJSON(rest.tables) });
        try {
            await writer.tableAdded(rest.restId, e.eventId - 1, e.payload.tables);
        } catch (error) {
            console.log(error.body);
            throw error;
        }

        // Assertions
        await utils.refresh(client, index);
        const res = await utils.search(client, index, rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if tableRemoved works', async function () {
        // Preset
        await utils.insertOne(client, index, toJSON(rest));
        await utils.refresh(client, index);
        
        // Update to do
        rest.tables = utils.defaultTables3;

        // Update done
        const e = new Event(rest.restId, 2, 'tableRemoved', { id: rest.restId, tables: toJSON(rest.tables) });
        await writer.tableRemoved(rest.restId, e.eventId - 1, e.payload.tables);

        // Assertions
        await utils.refresh(client, index);
        const res = await utils.search(client, index, rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if tablesChanged works', async function () {
        // Preset
        await utils.insertOne(client, index, toJSON(rest));
        await utils.refresh(client, index);

        // Update to do
        rest.tables = utils.defaultTables2;

        // Update done
        const e = new Event(rest.restId, 2, 'tablesChanged', { id: rest.restId, tables: toJSON(rest.tables) });
        await writer.tablesChanged(rest.restId, e.eventId - 1, e.payload.tables);

        // Assertions
        await utils.refresh(client, index);
        const res = await utils.search(client, index, rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if timetableChanged works', async function () {
        // Preset
        await utils.insertOne(client, index, toJSON(rest));
        await utils.refresh(client, index);
        
        // Update to do
        rest.timetable = utils.defaultTimetables2;

        // Update done
        const e = new Event(rest.restId, 2, 'timetableChanged', { id: rest.restId, timetable: toJSON(rest.timetable) });
        await writer.timetableChanged(rest.restId, e.eventId - 1, e.payload.timetable);

        // Assertions
        await utils.refresh(client, index);
        const res = await utils.search(client, index, rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if menuSectionAdded works', async function () {
        // Preset
        await utils.insertOne(client, index, toJSON(rest));
        await utils.refresh(client, index);

        // Update to do
        rest.menu = utils.defaultMenu2;

        // Update done
        const e = new Event(rest.restId, 2, 'menuSectionAdded', { id: rest.restId, menu: toJSON(rest.menu) });
        await writer.menuSectionAdded(rest.restId, e.eventId - 1, e.payload.menu);

        // Assertions
        await utils.refresh(client, index);
        const res = await utils.search(client, index, rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if menuSectionRemoved works', async function () {
        // Preset
        await utils.insertOne(client, index, toJSON(rest));
        await utils.refresh(client, index);

        // Update to do
        rest.menu = utils.defaultMenu2;

        // Update done
        const e = new Event(rest.restId, 2, 'menuSectionRemoved', { id: rest.restId, menu: toJSON(rest.menu) });
        await writer.menuSectionRemoved(rest.restId, e.eventId - 1, e.payload.menu);

        // Assertions
        await utils.refresh(client, index);
        const res = await utils.search(client, index, rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if dishAdded works', async function () {
        // Preset
        await utils.insertOne(client, index, toJSON(rest));
        await utils.refresh(client, index);

        // Update to do
        rest.menu = utils.defaultMenu2;

        // Update done
        const e = new Event(rest.restId, 2, 'dishAdded', { id: rest.restId, menu: toJSON(rest.menu) });
        await writer.dishAdded(rest.restId, e.eventId - 1, e.payload.menu);

        // Assertions
        await utils.refresh(client, index);
        const res = await utils.search(client, index, rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if dishRemoved works', async function () {
        // Preset
        await utils.insertOne(client, index, toJSON(rest));
        await utils.refresh(client, index);

        // Update to do
        rest.menu = utils.defaultMenu2;

        // Update done
        const e = new Event(rest.restId, 2, 'dishRemoved', { id: rest.restId, menu: toJSON(rest.menu) });
        await writer.dishRemoved(rest.restId, e.eventId - 1, e.payload.menu);

        // Assertions
        await utils.refresh(client, index);
        const res = await utils.search(client, index, rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });

    it('check if dishUpdated works', async function () {
        // Preset
        await utils.insertOne(client, index, toJSON(rest));
        await utils.refresh(client, index);

        // Update to do
        rest.menu = utils.defaultMenu2;

        // Update done
        const e = new Event(rest.restId, 2, 'dishUpdated', { id: rest.restId, menu: toJSON(rest.menu) });
        await writer.dishUpdated(rest.restId, e.eventId - 1, e.payload.menu);

        // Assertions
        await utils.refresh(client, index);
        const res = await utils.search(client, index, rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, toJSON(rest));
    });
    
    it('check if restaurantRemoved works', async function () {
        // Preset
        await utils.insertOne(client, index, toJSON(rest));
        await utils.refresh(client, index);

        // Update done
        const e = new Event(rest.restId, 2, 'restaurantRemoved', { id: rest.restId });
        await writer.restaurantRemoved(e.streamId, e.eventId - 1);

        // Assertions
        await utils.refresh(client, index);
        const res = await utils.search(client, index, rest.restId);
        const doc = res.body;
        assert.deepStrictEqual(doc, null);
    });

    after(async () => {
        await client.close();
    });

});
