const assert = require('assert');
const ENV = require('../src/env');

const Table = require('../domain/models/table');
const Restaurant = require('../domain/models/restaurant');
const db = require('../infrastructure/repository/repositoryManager')('testdb');
const restMgr = require('../domain/logic/restaurantManager')(db);

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
    const rest = new Restaurant(18, name, owner);
    const equals = (actual, exprected) => {
        assert.strictEqual(actual.id, exprected.id);
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
        const result = await restMgr.restaurantCreated(rest);
        equals(result, rest);
    });
    
    it('check if getRestaurant() works properly', async function () {
        await waitAsync(waitAsyncTimeout);
        const result = await restMgr.getRestaurant(rest.id);
        equals(result, rest);
    });
    
    it('check if tableAdded() works properly', async function () {
        const table = new Table(1, rest.id, 4);
        rest.addTable(table);
        const result = await restMgr.tableAdded(rest.id, table);
        equals(result, rest);
    });
    
    it('check if getRestaurant() works properly', async function () {
        await waitAsync(waitAsyncTimeout);
        const result = await restMgr.getRestaurant(rest.id);
        equals(result, rest);
    });
    
    it('check if tablesAdded() works properly', async function () {
        const table = new Table(2, rest.id, 4);
        rest.addTables([table]);
        await waitAsync(waitAsyncTimeout);
        
        let result = await restMgr.tablesAdded(rest.id, [table]);
        equals(result, rest);
        await waitAsync(waitAsyncTimeout);
        
        result = await restMgr.getRestaurant(rest.id);
        equals(result, rest);
    });
    
    it('check if tableRemoved() works properly', async function () {
        const table = new Table(2, rest.id, 4);
        rest.removeTable(table);
        const result = await restMgr.tableRemoved(rest.id, table);
        equals(result, rest);
    });
    
    it('check if tablesRemoved() works properly', async function () {
        const table = new Table(1, rest.id, 4);
        rest.removeTables([table]);
        const result = await restMgr.tablesRemoved(rest.id, [table]);
        equals(result, rest);
    });
});
