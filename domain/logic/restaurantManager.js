const uuid = require('uuid/v4');
const Restaurant = require('../models/restaurant');
const timetableLib = require('../models/timetable');
const Timetable = timetableLib.Timetable;
const DayTimetable = timetableLib.DayTimetable;
const Menu = require('../models/menu').Menu;
const Phone = require('../models/phone');
const checker = require('../../lib/checkers');

class RestaurantManager {
    constructor(db) {
        this.db = db;
    }

    restaurantCreated(res, cb) {
        const dbmanager = this.db;
        return new Promise(async (resolve, reject) => {
            try {
                const menu = Menu.fromObject(res.menu);
                const telephone = new Phone(res.telephone);
                const timetable = new Timetable();
                res.timetable.forEach(dt => {
                    timetable.setDay(DayTimetable.fromObject(dt));
                });
                const rest = new Restaurant(res.restId || uuid(), res.restaurantName, res.owner, timetable, menu, telephone);
                await dbmanager.restaurantCreated(rest, cb);
                resolve(rest);
            } catch (e) {
                reject(e);
            }
        });
        // return rest;
    }
    
    restaurantRemoved(restId, cb) {
        const dbmanager = this.db;
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
    
    tableAdded(restId, table, cb) {
        const dbmanager = this.db;
        return new Promise(async (resolve, reject) => {
            try {
                checker.checkRestId(restId);
                checker.checkTable(table);
                let rest = await dbmanager.getRestaurant(restId);
                const tables = rest.addTable(table);
                await dbmanager.tableAdded(rest, tables, cb);
                resolve(rest);
            } catch (e) {
                reject(e);
            }
        });
        // return tables;
    }
    
    tableRemoved(restId, table, cb) {
        const dbmanager = this.db;
        return new Promise(async (resolve, reject) => {
            try {
                checker.checkRestId(restId);
                checker.checkTable(table);
                let rest = await dbmanager.getRestaurant(restId);
                const tables = rest.removeTable(table);
                await dbmanager.tableRemoved(rest, tables, cb);
                resolve(rest);
            } catch (e) {
                reject(e);
            }
        });
        // return tables;
    }
    
    tablesAdded(restId, tablesArr, cb) {
        const dbmanager = this.db;
        return new Promise(async (resolve, reject) => {
            try {
                checker.checkRestId(restId);
                let rest = await dbmanager.getRestaurant(restId);
                // Tira un errore se non è un array di tavoli.
                // Ritorna true se l'array è vuoto (evita un ciclo di scrittura su DB)
                // Ritorna false se l'array non è vuoto
                // TODO: mettere a posto per un comportamento più consistente
                if (checker.checkTables(tablesArr)) {
                    resolve(rest);
                    return;
                }
                const tables = rest.addTables(tablesArr);
                await dbmanager.tableAdded(rest, tables, cb);
                resolve(rest);
            } catch (e) {
                reject(e);
            }
        });
        // return tables;
    }
    
    tablesRemoved(restId, tablesArr, cb) {
        const dbmanager = this.db;
        return new Promise(async (resolve, reject) => {
            try {
                checker.checkRestId(restId);
                let rest = await dbmanager.getRestaurant(restId);
                if (checker.checkTables(tablesArr)) {
                    resolve(rest);
                    return;
                }
                const tables = rest.removeTables(tablesArr);
                await dbmanager.tableRemoved(rest, tables, cb);
                resolve(rest);
            } catch (e) {
                reject(e);
            }
        });
        // return tables;
    }
    
    getTables(restId, cb) {
        const dbmanager = this.db;
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
    
    getRestaurant(restId, cb) {
        const dbmanager = this.db;
        const result = new Promise(async (resolve, reject) => {
            try {
                const rest = await dbmanager.getRestaurant(restId, cb);
                if (rest.status === 'removed') {
                    const err = new Error('Restaurant not found');
                    err.code = 404;
                    throw err;
                }
                resolve(rest);
            } catch (e) {
                reject(e);
            }
        });
        if (cb)
            return null;
        return result;
    }
}

function restaurantManager(store) {
    return new RestaurantManager(store);
}

module.exports = restaurantManager;
