const assert = require('assert');
const uuid = require('uuid/v4');
const lib = require('./lib/restaurant-test.lib');
const Table = require('../../domain/models/table');
const Restaurant = require('../../domain/models/restaurant');
const RestaurantError = require('../../domain/errors/restaurant_error');

describe('Restaurant class unit test', function () {
    const name = 'Tavola dei quattro venti';
    const owner = 'Luca';
    // const rest = new Restaurant(1, name, owner, lib.defaultTimetable, lib.defaultMenu, lib.defaultPhone);
    it('check constructor works', function () {
        assert.throws(() => new Restaurant(1, 'a'), RestaurantError);
        const rest = new Restaurant(1, name, owner, lib.defaultTimetable, lib.defaultMenu, lib.defaultPhone);
        assert.strictEqual(rest.restId, 1);
        assert.strictEqual(rest.restaurantName, 'Tavola dei quattro venti');
        assert.strictEqual(rest.owner, 'Luca');
        assert.deepStrictEqual(rest.timetable, lib.defaultTimetable);
        assert.deepStrictEqual(rest.menu, lib.defaultMenu);
        assert.deepStrictEqual(rest.telephone, lib.defaultPhone);
    });
    it('check if addTable() works properly', function () {
        const rest = new Restaurant(1, name, owner, lib.defaultTimetable, lib.defaultMenu, lib.defaultPhone);
        assert.throws(() => rest.addTable(), RestaurantError);
        assert.throws(() => rest.addTable({}), RestaurantError);
        const tableId = uuid();
        const table = new Table(tableId, 4);
        assert.deepStrictEqual(rest.addTable(table), [table]);
        assert.strictEqual(rest.addTable(table), null);
    });
    it('check if removeTable() works properly', function () {
        const rest = new Restaurant(1, name, owner, lib.defaultTimetable, lib.defaultMenu, lib.defaultPhone);
        assert.throws(() => rest.removeTable(), RestaurantError);
        assert.throws(() => rest.removeTable({}), RestaurantError);
        
        const table1 = new Table(uuid(), 4);
        const table2 = new Table(uuid(), 4);
        rest.addTable(table1);
        rest.addTable(table2);
        assert.deepStrictEqual(rest.removeTable(table2.id), [table1]);
        assert.deepStrictEqual(rest.removeTable(table1), []);
    });
    it('check if setTables() works properly', function () {
        const rest = new Restaurant(1, name, owner, lib.defaultTimetable, lib.defaultMenu, lib.defaultPhone);
        assert.throws(() => rest.setTables(), RestaurantError);
        assert.throws(() => rest.setTables([{}]), RestaurantError);

        const table1 = new Table(uuid(), 4);
        const table2 = new Table(uuid(), 4);

        assert.deepStrictEqual(rest.setTables([]), []);
        assert.deepStrictEqual(rest.setTables([table1, table2]), [table1, table2]);
    });
    it('check if addTables() works properly', function () {
        const rest = new Restaurant(1, name, owner, lib.defaultTimetable, lib.defaultMenu, lib.defaultPhone);
        assert.throws(() => rest.addTables(), RestaurantError);
        assert.throws(() => rest.addTables([{}]), RestaurantError);

        const table1 = new Table(uuid(), 4);
        const table2 = new Table(uuid(), 4);

        assert.deepStrictEqual(rest.addTables([]), null);
        assert.deepStrictEqual(rest.addTables([table1, table2]), [table1, table2]);
    });
    it('check if removeTables() works properly', function () {
        const rest = new Restaurant(1, name, owner, lib.defaultTimetable, lib.defaultMenu, lib.defaultPhone);
        assert.throws(() => rest.removeTables(), RestaurantError);
        assert.throws(() => rest.removeTables([{}]), RestaurantError);
        
        const table1 = new Table(uuid(), 4);
        const table2 = new Table(uuid(), 4);

        rest.addTables([table1, table2]);

        assert.deepStrictEqual(rest.removeTables([]), null);
        assert.deepStrictEqual(rest.removeTables([table1]), [table2]);
        assert.deepStrictEqual(rest.removeTables([table2.id]), []);
    });
});
