const assert = require('assert');
const uuid = require('uuid/v4');
const ENV = require('../../src/env');
const store = require('@danver97/event-sourcing/eventStore')['testdb'];

const Table = require('../../domain/models/table');
const menuLib = require('../../domain/models/menu');
const restaurantEvents = require('../../lib/restaurant-events');
const Restaurant = require('../../domain/models/restaurant');
const RestaurantError = require('../../domain/errors/restaurant.error');
const lib = require('./lib/restaurant-test.lib');
const db = require('../../infrastructure/repository/repositoryManager')('testdb');
const assertStrictEqual = require('../../lib/utils').assertStrictEqual;

const Menu = menuLib.Menu;
const MenuSection = menuLib.MenuSection;
const Dish = menuLib.Dish;
const Price = menuLib.Price;

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

    it('check if tablesChanged works', async function () {
        // Creates a restaurant
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        await db.restaurantCreated(rest, cb);
        
        // Changes tables to it
        const tableId = uuid();
        const table = new Table(tableId, 4);
        await waitAsync(waitAsyncTimeout);
        let restFromDb = await db.getRestaurant(rest.restId);
        tables = restFromDb.setTables([table]);
        await db.tablesChanged(restFromDb, tables, cb);

        // Checks if the event is written correctly
        await waitAsync(waitAsyncTimeout);
        const eventStream = await db.getStream(rest.restId);
        const lastEvent = eventStream[eventStream.length-1];
        const tableObj = JSON.parse(JSON.stringify(table));
        assert.deepStrictEqual(lastEvent.payload, { id: rest.restId, tables: [tableObj]})
    });

    it('check if timetableChanged works', async function () {
        // Creates a restaurant
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        await db.restaurantCreated(rest, cb);
        
        // Changes timetables to it
        const timetable2 = lib.defaultTimetable2;
        await waitAsync(waitAsyncTimeout);
        let restFromDb = await db.getRestaurant(rest.restId);
        restFromDb.setTimetable(timetable2);
        await db.timetableChanged(restFromDb, timetable2, cb);

        // Checks if the event is written correctly
        await waitAsync(waitAsyncTimeout);
        const eventStream = await db.getStream(rest.restId);
        const lastEvent = eventStream[eventStream.length-1];
        const timetableObj = JSON.parse(JSON.stringify(timetable2));
        assert.strictEqual(lastEvent.message, restaurantEvents.timetableChanged);
        assert.deepStrictEqual(lastEvent.payload, { id: rest.restId, timetable: timetableObj })
    });

    it('check if locationChanged works', async function () {
        // Creates a restaurant
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        await db.restaurantCreated(rest, cb);
        
        // Changes timetables to it
        const location = lib.defaultLocation;
        await waitAsync(waitAsyncTimeout);
        let restFromDb = await db.getRestaurant(rest.restId);
        restFromDb.setLocation(location);
        await db.locationChanged(restFromDb, location, cb);

        // Checks if the event is written correctly
        await waitAsync(waitAsyncTimeout);
        const eventStream = await db.getStream(rest.restId);
        const lastEvent = eventStream[eventStream.length-1];
        const locationObj = JSON.parse(JSON.stringify(location));
        assert.strictEqual(lastEvent.message, restaurantEvents.locationChanged);
        assert.deepStrictEqual(lastEvent.payload, { id: rest.restId, location: locationObj });
    });

    it('check if menuSectionAdded works', async function () {
        // Creates a restaurant
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        await db.restaurantCreated(rest, cb);

        // Adds a new section to it
        const section = new MenuSection(1, 'Section x');
        let restFromDb = await db.getRestaurant(rest.restId);
        restFromDb.menu.addMenuSection(section);
        await db.menuSectionAdded(restFromDb, restFromDb.menu, cb);

        // Checks if the event is written correctly
        await waitAsync(waitAsyncTimeout);
        const eventStream = await db.getStream(rest.restId);
        const lastEvent = eventStream[eventStream.length-1];
        const menuObj = JSON.parse(JSON.stringify(restFromDb.menu));
        assert.deepStrictEqual(lastEvent.message, restaurantEvents.menuSectionAdded);
        assert.deepStrictEqual(lastEvent.payload, { id: rest.restId, menu: menuObj });
    });

    it('check if menuSectionRemoved works', async function () {
        // Creates a restaurant
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        await db.restaurantCreated(rest, cb);

        // Adds a new section to it
        const section = new MenuSection(1, 'Section x');
        let restFromDb = await db.getRestaurant(rest.restId);
        restFromDb.menu.addMenuSection(section);
        await db.menuSectionAdded(restFromDb, restFromDb.menu, cb);

        // Removes the section to it
        restFromDb = await db.getRestaurant(rest.restId);
        restFromDb.menu.removeMenuSection(section);
        await db.menuSectionRemoved(restFromDb, restFromDb.menu, cb);

        // Checks if the event is written correctly
        await waitAsync(waitAsyncTimeout);
        const eventStream = await db.getStream(rest.restId);
        const lastEvent = eventStream[eventStream.length-1];
        const menuObj = JSON.parse(JSON.stringify(restFromDb.menu));
        assert.deepStrictEqual(lastEvent.message, restaurantEvents.menuSectionRemoved);
        assert.deepStrictEqual(lastEvent.payload, { id: rest.restId, menu: menuObj })
    });

    it('check if dishAdded works', async function () {
        // Creates a restaurant
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        await db.restaurantCreated(rest, cb);

        // Adds a new dish to it
        const dish = new Dish('Pizza', new Price(7.99, 'EUR'), 'Best italian food');
        let restFromDb = await db.getRestaurant(rest.restId);
        restFromDb.menu.getMenuSection(menu.menuSections[0].name).addDish(dish);
        await db.dishAdded(restFromDb, restFromDb.menu, cb);

        // Checks if the event is written correctly
        await waitAsync(waitAsyncTimeout);
        const eventStream = await db.getStream(rest.restId);
        const lastEvent = eventStream[eventStream.length-1];
        const menuObj = JSON.parse(JSON.stringify(restFromDb.menu));
        assert.deepStrictEqual(lastEvent.message, restaurantEvents.dishAdded);
        assert.deepStrictEqual(lastEvent.payload, { id: rest.restId, menu: menuObj })
    });

    it('check if dishRemoved works', async function () {
        // Creates a restaurant
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        await db.restaurantCreated(rest, cb);

        // Adds a new dish to it
        const dish = new Dish('Pizza', new Price(7.99, 'EUR'), 'Best italian food');
        let restFromDb = await db.getRestaurant(rest.restId);
        restFromDb.menu.getMenuSection(menu.menuSections[0].name).addDish(dish);
        await db.dishAdded(restFromDb, restFromDb.menu, cb);

        // Removes the added dish
        restFromDb = await db.getRestaurant(rest.restId);
        restFromDb.menu.getMenuSection(menu.menuSections[0].name).removeDish(dish);
        await db.dishRemoved(restFromDb, restFromDb.menu, cb);

        // Checks if the event is written correctly
        await waitAsync(waitAsyncTimeout);
        const eventStream = await db.getStream(rest.restId);
        const lastEvent = eventStream[eventStream.length-1];
        const menuObj = JSON.parse(JSON.stringify(restFromDb.menu));
        assert.deepStrictEqual(lastEvent.message, restaurantEvents.dishRemoved);
        assert.deepStrictEqual(lastEvent.payload, { id: rest.restId, menu: menuObj })
    });

    it('check if dishUpdated works', async function () {
        // Creates a restaurant
        const rest = new Restaurant(uuid(), name, owner, timetable, menu, telephone);
        await db.restaurantCreated(rest, cb);

        // Adds a new dish to it
        const dish = new Dish('Pizza', new Price(7.99, 'EUR'), 'Best italian food');
        const dish_v2 = new Dish('Pizza', new Price(6.99, 'EUR'), 'Best italian food v2');
        let restFromDb = await db.getRestaurant(rest.restId);
        restFromDb.menu.getMenuSection(menu.menuSections[0].name).addDish(dish);
        await db.dishAdded(restFromDb, restFromDb.menu, cb);

        // Updates the added dish
        restFromDb = await db.getRestaurant(rest.restId);
        restFromDb.menu.getMenuSection(menu.menuSections[0].name).removeDish(dish);
        restFromDb.menu.getMenuSection(menu.menuSections[0].name).addDish(dish_v2);
        await db.dishUpdated(restFromDb, restFromDb.menu, cb);

        // Checks if the event is written correctly
        await waitAsync(waitAsyncTimeout);
        const eventStream = await db.getStream(rest.restId);
        const lastEvent = eventStream[eventStream.length-1];
        const menuObj = JSON.parse(JSON.stringify(restFromDb.menu));
        assert.deepStrictEqual(lastEvent.message, restaurantEvents.dishUpdated);
        assert.deepStrictEqual(lastEvent.payload, { id: rest.restId, menu: menuObj })
    });
});
