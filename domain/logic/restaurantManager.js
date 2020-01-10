const uuid = require('uuid/v4');
const Restaurant = require('../models/restaurant');
const checker = require('../../lib/checkers');

class RestaurantManager {
    constructor(db) {
        this.db = db;
    }

    restaurantCreated(res, cb) {
        const dbmanager = this.db;
        return new Promise(async (resolve, reject) => {
            try {
                const rest = new Restaurant(res.restId || uuid(), res.restaurantName, res.owner, res.timetable, res.menu, res.telephone);
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
    
    tableRemoved(restId, tableId, cb) {
        const dbmanager = this.db;
        return new Promise(async (resolve, reject) => {
            try {
                checker.checkRestId(restId);
                // checker.checkTable(table);
                let rest = await dbmanager.getRestaurant(restId);
                const tables = rest.removeTable(tableId);
                await dbmanager.tableRemoved(rest, tables, cb);
                resolve(rest);
            } catch (e) {
                reject(e);
            }
        });
        // return tables;
    }

    tablesChanged(restId, tablesArr, cb) {
        const dbmanager = this.db;
        return new Promise(async (resolve, reject) => {
            try {
                checker.checkRestId(restId);
                let rest = await dbmanager.getRestaurant(restId);
                const tables = rest.setTables(tablesArr);
                await dbmanager.tablesChanged(rest, tables, cb);
                resolve(rest);
            } catch (e) {
                reject(e);
            }
        });
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

    timetableChanged(restId, timetable, cb) {
        const dbmanager = this.db;
        return new Promise(async (resolve, reject) => {
            try {
                checker.checkRestId(restId);
                let rest = await dbmanager.getRestaurant(restId);
                rest.setTimetable(timetable);
                await dbmanager.timetableChanged(rest, rest.timetable, cb);
                resolve(rest);
            } catch (e) {
                reject(e);
            }
        });
    }

    locationChanged(restId, location, cb) {
        const dbmanager = this.db;
        return new Promise(async (resolve, reject) => {
            try {
                checker.checkRestId(restId);
                let rest = await dbmanager.getRestaurant(restId);
                rest.setLocation(location);
                await dbmanager.locationChanged(rest, rest.location, cb);
                resolve(rest);
            } catch (e) {
                reject(e);
            }
        });
    }

    menuSectionAdded(restId, menuSection, cb) {
        const dbmanager = this.db;
        return new Promise(async (resolve, reject) => {
            try {
                checker.checkRestId(restId);
                let rest = await dbmanager.getRestaurant(restId);
                rest.menu.addMenuSection(menuSection);
                await dbmanager.menuSectionAdded(rest, rest.menu, cb);
                resolve(rest);
            } catch (e) {
                reject(e);
            }
        });
    }

    menuSectionRemoved(restId, menuSectionName, cb) {
        const dbmanager = this.db;
        return new Promise(async (resolve, reject) => {
            try {
                checker.checkRestId(restId);
                let rest = await dbmanager.getRestaurant(restId);
                const deletedSection = rest.menu.removeMenuSection(menuSectionName);
                await dbmanager.menuSectionRemoved(rest, rest.menu, cb);
                resolve(rest);
            } catch (e) {
                reject(e);
            }
        });
    }

    dishAdded(restId, menuSectionName, dish, cb) {
        const dbmanager = this.db;
        return new Promise(async (resolve, reject) => {
            try {
                checker.checkRestId(restId);
                let rest = await dbmanager.getRestaurant(restId);
                rest.menu.getMenuSection(menuSectionName).addDish(dish);
                await dbmanager.dishAdded(rest, rest.menu, cb);
                resolve(rest);
            } catch (e) {
                reject(e);
            }
        });
    }

    dishRemoved(restId, menuSectionName, dish, cb) {
        const dbmanager = this.db;
        return new Promise(async (resolve, reject) => {
            try {
                checker.checkRestId(restId);
                let rest = await dbmanager.getRestaurant(restId);
                const deletedDish = rest.menu.getMenuSection(menuSectionName).removeDish(dish);
                await dbmanager.dishRemoved(rest, rest.menu, cb);
                resolve(rest);
            } catch (e) {
                reject(e);
            }
        });
    }

    dishUpdated(restId, menuSectionName, dish, cb) {
        const dbmanager = this.db;
        return new Promise(async (resolve, reject) => {
            try {
                checker.checkRestId(restId);
                let rest = await dbmanager.getRestaurant(restId);
                const section = rest.menu.getMenuSection(menuSectionName);
                const oldDish = section.removeDish(dish.name);
                section.addDish(dish);
                await dbmanager.dishUpdated(rest, rest.menu, cb);
                resolve(rest);
            } catch (e) {
                reject(e);
            }
        });
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
