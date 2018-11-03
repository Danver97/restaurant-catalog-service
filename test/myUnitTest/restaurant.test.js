const assert = require('assert');
const Restaurant = require('../../models/restaurant');
const Table = require('../../models/table');
const RestaurantError = require('../../errors/restaurant_error');

let passed = true;

if(process.env.NODE_TEST_TYPE === 'mytest') {
    try {
        const name = 'Tavola dei quattro venti';
        const owner = 'Luca';
        const rest = new Restaurant(1, name, owner);
        assert.strictEqual(rest.id, 1);
        assert.strictEqual(rest.restaurantName, 'Tavola dei quattro venti');
        assert.strictEqual(rest.owner, 'Luca');
        assert.throws(() => new Restaurant(1, 'a'), RestaurantError);
        rest.addTable(new Table(1, rest.id, 4));
        assert.strictEqual(JSON.stringify(rest.tables),
            JSON.stringify([{ id: 1, restaurantId: rest.id, people: 4 }]));
    } catch (e) {
        console.log(e);
        passed = false;
    }
}

module.exports = { success: passed };
