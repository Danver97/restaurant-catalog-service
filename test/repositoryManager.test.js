const assert = require('assert');
const ENV = require('../src/env');

const Table = require('../models/table');
const Restaurant = require('../models/restaurant');
const RestaurantError = require('../errors/restaurant_error');
const db = require('../modules/repositoryManager');
const assertStrictEqual = require('../lib/utils').assertStrictEqual;

const waitAsync = ms => new Promise(resolve => setTimeout(() => resolve(), ms));
const waitAsyncTimeout = 0;

describe('RepositoryManager unit test using: ' + ENV.event_store, function () {
    
    let id = 1;
    const name = 'Tavola dei quattro venti';
    const owner = 'Luca';
    let rest = new Restaurant(id++, name, owner);
    let tables;
    const rest2 = new Restaurant(id++, name, owner);
    let tables2;
    const cb = (err, event) => {
        const doIt = false;
        if (doIt) {
            console.log(err);
            console.log(event);
        }
    };
    
    before(() => {
        if (ENV.node_env === 'test')
            db.reset();
        else if (ENV.node_env === 'test_event_sourcing')
            db.store.reset();
    });
    
    it('check if Restaurant is created', async function () {
        await db.restaurantCreated(rest, cb);
        await waitAsync(waitAsyncTimeout);
        const response = await db.getRestaurant(rest.id);
        // assert.strictEqual(JSON.stringify(response), JSON.stringify(rest));
        assertStrictEqual(response, rest);
    });
    
    it('check if Restaurant is removed', async function () {
        const restFromDb = await db.getRestaurant(rest.id);
        // await db.restaurantRemoved(rest);
        await db.restaurantRemoved(restFromDb);
        await waitAsync(waitAsyncTimeout);
        try {
            await db.getRestaurant(rest.id);
        } catch (e) {
            assert.strictEqual(e.code, 404);
            assert.throws(() => {
                throw e;
            }, RestaurantError);
        }
        /* try {
            await db.getRestaurant(rest.id);
        } catch (e) {
            assert.strictEqual(e.code, 404);
            assert.throws(() => {
                throw e;
            }, RestaurantError);
        } */
    });
    
    it('check if first Restaurant tables are added', async function () {
        rest = new Restaurant(id++, name, owner);
        await db.restaurantCreated(rest, cb);
        
        // tables = rest.addTable(new Table(1, rest.id, 4));
        const restFromDb = await db.getRestaurant(rest.id);
        tables = restFromDb.addTable(new Table(1, rest.id, 4));
        // await db.tableAdded(rest, tables, cb);
        await db.tableAdded(restFromDb, tables, cb);
        
        await waitAsync(waitAsyncTimeout);
        
        const response = await db.getRestaurant(rest.id);
        // assert.strictEqual(JSON.stringify(response.tables), JSON.stringify(tables));
        assertStrictEqual(response.tables, tables);
    });
    
    it('check if second Restaurant tables are added', async function () {
        await db.restaurantCreated(rest2, cb);
        // tables2 = rest2.addTable(new Table(1, rest2.id, 4));
        const restFromDb = await db.getRestaurant(rest2.id);
        tables2 = restFromDb.addTable(new Table(1, rest2.id, 4));
        // await db.tableAdded(rest2, tables2, cb);
        await db.tableAdded(restFromDb, tables2, cb);
        
        await waitAsync(waitAsyncTimeout);
        const response = await db.getRestaurant(rest2.id);
        // assert.strictEqual(JSON.stringify(response.tables), JSON.stringify(tables2));
        assertStrictEqual(response.tables, tables2);
    });
    
    it('check if second Restaurant tables are removed', async function () {
        const restFromDb = await db.getRestaurant(rest2.id);
        // tables2 = rest2.removeTable(1);
        // await db.tableRemoved(rest2, tables2);
        tables2 = restFromDb.removeTable(1);
        await db.tableRemoved(restFromDb, tables2);
        
        await waitAsync(waitAsyncTimeout);
        const response = await db.getRestaurant(rest2.id);
        // assert.strictEqual(JSON.stringify(response.tables), JSON.stringify([]));
        assertStrictEqual(response.tables, []);
    });
    
    it('check if second Restaurant tables are removed', async function () {
        const restFromDb = await db.getRestaurant(rest.id);
        // tables = rest.removeTable(1);
        // await db.tableRemoved(rest, tables);
        tables = restFromDb.removeTable(1);
        await db.tableRemoved(restFromDb, tables);
        
        await waitAsync(waitAsyncTimeout);
        const response = await db.getRestaurant(rest.id);
        // assert.strictEqual(JSON.stringify(response.tables), JSON.stringify([]));
        assertStrictEqual(response.tables, []);
    });
});
