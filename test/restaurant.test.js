const assert = require('assert');
const Table = require('../models/table');
const Restaurant = require('../models/restaurant');
const RestaurantError = require('../errors/restaurant_error');

describe('Restaurant class unit test', function () {
    const name = 'Tavola dei quattro venti';
    const owner = 'Luca';
    const rest = new Restaurant(1, name, owner);
    it('check if Restaurant is created with the right attributes', function () {
        assert.strictEqual(rest.id, 1);
        assert.strictEqual(rest.restaurantName, 'Tavola dei quattro venti');
        assert.strictEqual(rest.owner, 'Luca');
    });
    it('check if missing constructor params throws a RestaurantError except', function () {
        assert.throws(() => new Restaurant(1, 'a'), RestaurantError);
    });
    it('check if addTable() works properly', function () {
        assert.strictEqual(JSON.stringify(rest.addTable(new Table(1, rest.id, 4))),
            JSON.stringify([{ id: 1, restaurantId: rest.id, people: 4 }]));
        assert.strictEqual(JSON.stringify(rest.addTable(new Table(1, rest.id, 4))),
            JSON.stringify(null));
        assert.throws(() => rest.addTable(), RestaurantError);
        assert.throws(() => rest.addTable({}), RestaurantError);
    });
    it('check if removeTable() works properly', function () {
        rest.addTable(new Table(2, rest.id, 4));
        assert.strictEqual(JSON.stringify(rest.removeTable(2)),
            JSON.stringify([{ id: 1, restaurantId: rest.id, people: 4 }]));
        assert.strictEqual(JSON.stringify(rest.removeTable(new Table(1, rest.id, 4))),
            JSON.stringify([]));
        assert.throws(() => rest.removeTable(), RestaurantError);
        assert.throws(() => rest.removeTable({}), RestaurantError);
    });
    it('check if addTables() works properly', function () {
        assert.throws(() => rest.addTables(), RestaurantError);
        assert.throws(() => rest.addTables([{}]), RestaurantError);
        assert.strictEqual(JSON.stringify(rest.addTables([])),
            JSON.stringify(null));
        assert.strictEqual(
            JSON.stringify(rest.addTables([new Table(1, rest.id, 4), new Table(2, rest.id, 4)])),
            JSON.stringify([{
                id: 1,
                restaurantId: rest.id,
                people: 4,
            }, {
                id: 2,
                restaurantId: rest.id,
                people: 4,
            }]),
        );
    });
    it('check if removeTables() works properly', function () {
        assert.throws(() => rest.removeTables(), RestaurantError);
        assert.throws(() => rest.removeTables([{}]), RestaurantError);
        assert.strictEqual(JSON.stringify(rest.removeTables([])),
            JSON.stringify(null));
        assert.strictEqual(JSON.stringify(rest.removeTables([new Table(2, rest.id, 4)])),
            JSON.stringify([{ id: 1, restaurantId: rest.id, people: 4 }]));
        assert.strictEqual(JSON.stringify(rest.removeTables([1])),
            JSON.stringify([]));
    });
});
