const assert = require('assert');
const Table = require('../domain/models/table');

describe('Table class unit test', function () {
    const table = new Table(1, 1, 4);
    it('check if Table is created with the right attributes', function () {
        assert.strictEqual(table.id, 1);
        assert.strictEqual(table.restaurantId, 1);
        assert.strictEqual(table.people, 4);
    });
    it('check if setId() works', function () {
        table.setId(2);
        assert.strictEqual(table.id, 2);
    });
});
