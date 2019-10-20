const assert = require('assert');
const uuid = require('uuid/v4');
const Table = require('../../domain/models/table');

describe('Table class unit test', function () {
    it('check constructor works', () => {
        assert.throws(() => new Table(), Error);
        assert.throws(() => new Table(1), Error);
        assert.throws(() => new Table('aa', 'a'), Error);
        const id = uuid();
        const people = 4;
        const table = new Table(id, people);
        assert.strictEqual(table.id, id);
        assert.strictEqual(table.people, people);

    });

    it('check if setId() works', function () {
        const table = new Table(uuid(), 4);
        assert.throws(() => table.setId(), Error);
        assert.throws(() => table.setId(1), Error);
        const newId = uuid();
        table.setId(newId);
        assert.strictEqual(table.id, newId);
    });
});
