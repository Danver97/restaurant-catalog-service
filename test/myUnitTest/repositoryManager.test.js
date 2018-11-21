const assert = require('assert');
const Restaurant = require('../../domain/models/restaurant');
const Table = require('../../domain/models/table');
const db = require('../../infrastructure/repository/repositoryManager');

let passed = true;
const timeout = 1;

function cb(err, event) {
    const doIt = false;
    if (doIt) {
        console.log(err);
        console.log(event);
    }
}

let result;
const cbGetRest = (err, rest) => {
    if (err) throw err;
    result = rest;
};

function sleep(milliseconds) {
    const start = new Date().getTime();
    for (let i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

if(process.env.NODE_TEST_TYPE === 'mytest') {
    try {
        let id = 1;
        const name = 'Tavola dei quattro venti';
        const owner = 'Luca';
        let rest = new Restaurant(id++, name, owner);

        db.restaurantCreated(rest, cb);
        db.getRestaurant(rest.id, cbGetRest);
        assert.strictEqual(JSON.stringify(result), JSON.stringify(rest));
        db.restaurantRemoved(rest);
        sleep(timeout);
        // assert.doesNotThrow(() => db.restaurantRemoved(rest), TypeError);
        db.getRestaurant(rest.id, cbGetRest);
        assert.strictEqual(JSON.stringify(result), JSON.stringify(null));

        rest = new Restaurant(id++, name, owner);
        db.restaurantCreated(rest, cb);
        let tables = rest.addTable(new Table(1, rest.id, 4));
        db.tableAdded(rest.id, tables, cb);
        db.getRestaurant(rest.id, cbGetRest);
        assert.strictEqual(JSON.stringify(result.tables), JSON.stringify(tables));
        sleep(timeout);

        const res2 = new Restaurant(id++, name, owner);
        db.restaurantCreated(res2, cb);
        let tables2 = res2.addTable(new Table(1, res2.id, 4));
        db.tableAdded(res2.id, tables2, cb);
        db.getRestaurant(res2.id, cbGetRest);
        assert.strictEqual(JSON.stringify(result.tables), JSON.stringify(tables2));
        sleep(timeout);
        tables2 = res2.removeTable(1);
        db.tableRemoved(res2.id, tables2);
        db.getRestaurant(res2.id, cbGetRest);
        assert.strictEqual(JSON.stringify(result.tables), JSON.stringify([]));
        sleep(timeout);
        tables = rest.removeTable(1);
        db.tableRemoved(rest.id, tables);
        db.getRestaurant(rest.id, cbGetRest);
        assert.strictEqual(JSON.stringify(result.tables), JSON.stringify([]));
        // TODO: tablesAdded/Removed;
    } catch (e) {
        console.log(e);
        passed = false;
    }
}

module.exports = { success: passed };
