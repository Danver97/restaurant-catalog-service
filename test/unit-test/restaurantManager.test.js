const assert = require('assert');
const uuid = require('uuid/v4');
const ENV = require('../../src/env');

const Table = require('../../domain/models/table');
const Restaurant = require('../../domain/models/restaurant');
const lib = require('./lib/restaurant-test.lib');
const db = require('../../infrastructure/repository/repositoryManager')('testdb');
const restMgr = require('../../domain/logic/restaurantManager')(db);

function wait(ms) {
    const start = Date.now();
    let now = start;
    while (now - start < ms)
        now = Date.now();
}

const waitAsync = (ms) => new Promise(resolve => setTimeout(() => resolve(), ms));
const waitAsyncTimeout = 10;

describe('Restaurant Manager unit test', function () {
    const name = 'I Quattro Cantoni';
    const owner = 'Gincarlo';
    const timetable = lib.defaultTimetable;
    const menu = lib.defaultMenu;
    const telephone = lib.defaultPhone;
    const equals = (actual, exprected) => {
        assert.strictEqual(actual.restId, exprected.restId);
        assert.strictEqual(actual.restaurantName, exprected.restaurantName);
        assert.strictEqual(actual.owner, exprected.owner);
        assert.strictEqual(JSON.stringify(actual.tables), JSON.stringify(exprected.tables));
    };
    
    before(() => {
        if (ENV.node_env === 'test')
            db.reset();
        else if (ENV.node_env === 'test_event_sourcing')
            db.reset(); // .store 
    });
    
    it('check if restaurantCreated() works properly', async function () {
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        const result = await restMgr.restaurantCreated(rest);
        equals(result, rest);
    });
    
    it('check if getRestaurant() works properly', async function () {
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        let result = await restMgr.restaurantCreated(rest);

        await waitAsync(waitAsyncTimeout);
        result = await restMgr.getRestaurant(rest.restId);
        equals(result, rest);
    });
    
    it('check if tableAdded() works properly', async function () {
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        let result = await restMgr.restaurantCreated(rest);

        const table = new Table(uuid(), 4);
        rest.addTable(table);
        result = await restMgr.tableAdded(rest.restId, table);
        equals(result, rest);

        await waitAsync(waitAsyncTimeout);
        result = await restMgr.getRestaurant(rest.restId);
        equals(result, rest);
    });
    
    it('check if tablesAdded() works properly', async function () {
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        let result = await restMgr.restaurantCreated(rest);

        await waitAsync(waitAsyncTimeout);
        const table = new Table(uuid(), 4);
        rest.addTables([table]);
        result = await restMgr.tablesAdded(rest.restId, [table]);
        equals(result, rest);

        await waitAsync(waitAsyncTimeout);
        result = await restMgr.getRestaurant(rest.restId);
        equals(result, rest);
    });
    
    it('check if tableRemoved() works properly', async function () {
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        let result = await restMgr.restaurantCreated(rest);
        
        await waitAsync(waitAsyncTimeout);
        const table = new Table(uuid(), 4);
        rest.addTables([table]);
        result = await restMgr.tableAdded(rest.restId, table);
        
        await waitAsync(waitAsyncTimeout);
        rest.removeTable(table);
        result = await restMgr.tableRemoved(rest.restId, table);
        equals(result, rest);
        
        await waitAsync(waitAsyncTimeout);
        result = await restMgr.getRestaurant(rest.restId);
        equals(result, rest);
    });
    
    it('check if tablesRemoved() works properly', async function () {
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        let result = await restMgr.restaurantCreated(rest);
        
        await waitAsync(waitAsyncTimeout);
        const table = new Table(uuid(), 4);
        rest.addTables([table]);
        result = await restMgr.tablesAdded(rest.restId, [table]);
        
        await waitAsync(waitAsyncTimeout);
        rest.removeTables([table]);
        result = await restMgr.tablesRemoved(rest.restId, [table]);
        equals(result, rest);
        
        await waitAsync(waitAsyncTimeout);
        result = await restMgr.getRestaurant(rest.restId);
        equals(result, rest);
    });
    
    it('check if tablesChanged() works properly', async function () {
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        let result = await restMgr.restaurantCreated(rest);
        
        await waitAsync(waitAsyncTimeout);
        const table = new Table(uuid(), 4);
        rest.setTables([table]);
        result = await restMgr.tablesChanged(rest.restId, [table]);
        
        await waitAsync(waitAsyncTimeout);
        result = await restMgr.getRestaurant(rest.restId);
        equals(result, rest);
    });
    
    it('check if timetableChanged() works properly', async function () {
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        let result = await restMgr.restaurantCreated(rest);
        
        await waitAsync(waitAsyncTimeout);
        const timetable2 = lib.defaultTimetable2;
        rest.setTimetable(timetable2);
        result = await restMgr.timetableChanged(rest.restId, timetable2);
        
        await waitAsync(waitAsyncTimeout);
        result = await restMgr.getRestaurant(rest.restId);
        equals(result, rest);
    });
});
