const assert = require('assert');
const Table = require('../../models/table');

let passed = true;
if(process.env.NODE_TEST_TYPE === 'mytest') {
    try {
        const table = new Table(1, 1, 4);
        assert.strictEqual(table.id, 1);
        assert.strictEqual(table.restaurantId, 1);
        assert.strictEqual(table.people, 4);
        table.setId(2);
        assert.strictEqual(table.id, 2);
    } catch (e) {
        console.log(e);
        passed = false;
    }
}

module.exports = { success: passed };
