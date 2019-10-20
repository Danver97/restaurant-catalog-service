const assert = require('assert');
const uuid = require('uuid/v4');
const ENV = require('../../src/env');

const Table = require('../../domain/models/table');
const Restaurant = require('../../domain/models/restaurant');
const RestaurantError = require('../../domain/errors/restaurant_error');
const lib = require('./lib/restaurant-test.lib');
const db = require('../../infrastructure/repository/repositoryManager')('testdb');
const assertStrictEqual = require('../../lib/utils').assertStrictEqual;

const waitAsync = ms => new Promise(resolve => setTimeout(() => resolve(), ms));
const waitAsyncTimeout = 50;

describe('RepositoryManager unit test using: ' + ENV.event_store, function () {

    const name = 'Tavola dei quattro venti';
    const owner = 'Luca';
    const timetable = lib.defaultTimetable;
    const menu = lib.defaultMenu;
    const telephone = lib.defaultPhone;
    let tables;
    let tables2;
    const cb = (err, event) => {
        const doIt = false;
        if (doIt) {
            console.log(err);
            console.log(event);
        }
    };

    it('check if Restaurant is created', async function () {
        const rest = new Restaurant(uuid(), name, owner, lib.defaultTimetable, lib.defaultMenu, lib.defaultPhone);
        await db.restaurantCreated(rest, cb);
        await waitAsync(waitAsyncTimeout);
        const response = await db.getRestaurant(rest.restId);
        assertStrictEqual(response, rest);
    });

    it('check if Restaurant is removed', async function () {
        const rest = new Restaurant(uuid(), name, owner, lib.defaultTimetable, lib.defaultMenu, lib.defaultPhone);
        await db.restaurantCreated(rest, cb);
        const restFromDb = await db.getRestaurant(rest.restId);
        
        await db.restaurantRemoved(restFromDb);
        await waitAsync(waitAsyncTimeout);
        try {
            await db.getRestaurant(rest.restId);
        } catch (e) {
            assert.strictEqual(e.code, 404);
            assert.throws(() => {
                throw e;
            }, RestaurantError);
        }
    });

    it('check if first Restaurant tables are added', async function () {
        // Creates a restaurant
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        await db.restaurantCreated(rest, cb);

        // Adds tables to it
        await waitAsync(waitAsyncTimeout);
        const restFromDb = await db.getRestaurant(rest.restId);
        tables = restFromDb.addTable(new Table(uuid(), 4));
        await db.tableAdded(restFromDb, tables, cb);
        
        // Checks if the tables returned are the expected one
        await waitAsync(waitAsyncTimeout);
        const response = await db.getRestaurant(rest.restId);
        assertStrictEqual(response.tables, tables);
    });

    it('check if second Restaurant tables are added', async function () {
        // Creates a restaurant
        const rest2 = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        await db.restaurantCreated(rest2, cb);

        // Adds tables to it
        await waitAsync(waitAsyncTimeout);
        const restFromDb = await db.getRestaurant(rest2.restId);
        tables2 = restFromDb.addTable(new Table(uuid(), 4));
        await db.tableAdded(restFromDb, tables2, cb);

        // Checks if the tables returned are the expected one
        await waitAsync(waitAsyncTimeout);
        const response = await db.getRestaurant(rest2.restId);
        assertStrictEqual(response.tables, tables2);
    });

    it('check if second Restaurant tables are removed', async function () {
        // Creates a restaurant
        const rest2 = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        await db.restaurantCreated(rest2, cb);

        // Adds tables to it
        const tableId = uuid();
        await waitAsync(waitAsyncTimeout);
        let restFromDb = await db.getRestaurant(rest2.restId);
        tables2 = restFromDb.addTable(new Table(tableId, 4));
        await db.tableAdded(restFromDb, tables2, cb);
        
        // Removes tables from it
        await waitAsync(waitAsyncTimeout);
        restFromDb = await db.getRestaurant(rest2.restId);
        tables2 = restFromDb.removeTable(tableId);
        await db.tableRemoved(restFromDb, tables2);

        // Checks if the tables returned are the expected one
        await waitAsync(waitAsyncTimeout);
        const response = await db.getRestaurant(rest2.restId);
        assert.deepStrictEqual(response.tables, []);
    });

    it('check if first Restaurant tables are removed', async function () {
        // Creates a restaurant
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        await db.restaurantCreated(rest, cb);
        
        // Adds tables to it
        const tableId = uuid();
        await waitAsync(waitAsyncTimeout);
        let restFromDb = await db.getRestaurant(rest.restId);
        tables = restFromDb.addTable(new Table(tableId, 4));
        await db.tableAdded(restFromDb, tables, cb);

        // Removes tables from it
        await waitAsync(waitAsyncTimeout);
        restFromDb = await db.getRestaurant(rest.restId);
        tables = restFromDb.removeTable(tableId);
        await db.tableRemoved(restFromDb, tables);

        // Checks if the tables returned are the expected one
        await waitAsync(waitAsyncTimeout);
        const response = await db.getRestaurant(rest.restId);
        assert.deepStrictEqual(response.tables, []);
    });
});
