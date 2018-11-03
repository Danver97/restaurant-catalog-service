const Restaurant = require('../models/restaurant');
const dbmanager = require('./repositoryManager');
const checker = require('../lib/checkers');

/* TODO:
 * - Add command handlers that publish events on the event broker.
 * - Add event handlers that persist events on the event store.
*/

// Command handlers
// rst
function restaurantCreated(res, cb) {
    return new Promise(async (resolve, reject) => {
        try {
            const rest = new Restaurant(res.id, res.restaurantName, res.owner);
            await dbmanager.restaurantCreated(rest, cb);
            resolve(rest);
        } catch (e) {
            console.log(e);
            reject(e);
        }
    });
    // return rest;
}

function restaurantRemoved(restId, cb) {
    return new Promise(async (resolve, reject) => {
        try {
            checker.checkRestId(restId);
            const rest = await dbmanager.getRestaurant(restId);
            await dbmanager.restaurantRemoved(rest, cb);
            resolve(rest);
        } catch (e) {
            reject(e);
        }
    });
    // return rest;
}

function tableAdded(restId, table, cb) {
    return new Promise(async (resolve, reject) => {
        try {
            checker.checkRestId(restId);
            checker.checkTable(table);
            let rest = await dbmanager.getRestaurant(restId);
            const oldTables = checker.convertToTableArr(rest.tables);
            rest = new Restaurant(rest.id, rest.restaurantName, rest.owner);
            rest.addTables(oldTables);
            const tables = rest.addTable(table);
            await dbmanager.tableAdded(rest, tables, cb);
            resolve(rest);
        } catch (e) {
            reject(e);
        }
    });
    // return tables;
}

function tableRemoved(restId, table, cb) {
    return new Promise(async (resolve, reject) => {
        try {
            checker.checkRestId(restId);
            checker.checkTable(table);
            let rest = await dbmanager.getRestaurant(restId);
            const oldTables = checker.convertToTableArr(rest.tables);
            rest = new Restaurant(rest.id, rest.restaurantName, rest.owner);
            rest.addTables(oldTables);
            const tables = rest.removeTable(table);
            await dbmanager.tableRemoved(rest, tables, cb);
            resolve(rest);
        } catch (e) {
            reject(e);
        }
    });
    // return tables;
}

function tablesAdded(restId, tablesArr, cb) {
    return new Promise(async (resolve, reject) => {
        try {
            checker.checkRestId(restId);
            let rest = await dbmanager.getRestaurant(restId);
            if (checker.checkTables(tablesArr)) {
                resolve(rest);
                return;
            }
            const oldTables = checker.convertToTableArr(rest.tables);
            rest = new Restaurant(rest.id, rest.restaurantName, rest.owner);
            rest.addTables(oldTables);
            const tables = rest.addTables(tablesArr);
            await dbmanager.tableAdded(rest, tables, cb);
            resolve(rest);
        } catch (e) {
            reject(e);
        }
    });
    // return tables;
}

function tablesRemoved(restId, tablesArr, cb) {
    return new Promise(async (resolve, reject) => {
        try {
            checker.checkRestId(restId);
            let rest = await dbmanager.getRestaurant(restId);
            if (checker.checkTables(tablesArr)) {
                resolve(rest);
                return;
            }
            const oldTables = checker.convertToTableArr(rest.tables);
            rest = new Restaurant(rest.id, rest.restaurantName, rest.owner);
            rest.addTables(oldTables);
            const tables = rest.removeTables(tablesArr);
            await dbmanager.tableRemoved(rest, tables, cb);
            resolve(rest);
        } catch (e) {
            reject(e);
        }
    });
    // return tables;
}
// rcl

function getTables(restId, cb) {
    const result = new Promise(async (resolve, reject) => {
        try {
            let rest = await dbmanager.getRestaurant(restId, cb);
            if (cb)
                rest = {};
            resolve(rest.tables);
        } catch (e) {
            reject(e);
        }
    });
    if (cb)
        return null;
    return result;
}

function getRestaurant(restId, cb) {
    const result = new Promise(async (resolve, reject) => {
        try {
            const rest = await dbmanager.getRestaurant(restId, cb);
            resolve(rest);
        } catch (e) {
            reject(e);
        }
    });
    if (cb)
        return null;
    return result;
}

module.exports = {
    restaurantCreated,
    restaurantRemoved,
    tableAdded,
    tableRemoved,
    tablesAdded,
    tablesRemoved,
    getRestaurant,
    getTables,
};
