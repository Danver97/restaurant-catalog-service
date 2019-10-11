const RestaurantError = require('../errors/restaurant_error');
const Table = require('./table');
const checker = require('../../lib/checkers');

class Restaurant {
    constructor(restId, name, owner,re) {
        if (!restId || !name || !owner) throw new RestaurantError(`Invalid Restaurant constructor paramenters. ${restId} ${name} ${owner}`);
        this.id = restId;
        // this.restId = restId;
        this.restaurantName = name;
        this.owner = owner;
        this.tables = [];
    }

    static fromObject(obj) {
        const rest = new Restaurant(obj.id, obj.restaurantName, obj.owner);
        if (obj.tables)
            rest.addTables(obj.tables.map(t => Table.fromObject(t)));
        const classKeys = ['id', 'restaurantName', 'owner', 'tables'];
        Object.keys(obj).forEach(k => {
            if (!classKeys.includes(k))
                rest[k] = obj[k];
        });
        return rest;
    }

    addSchedule(schedule) {
        if (!schedule) throw new RestaurantError('Invalid schedule parameter.');
        this.schedule = schedule;
    }

    addTable(table) {
        if (!this.tables) this.tables = [];
        if (!table) throw new RestaurantError('Invalid table parameter: no null or undefined parameter allowed.');
        if (!(table instanceof Table)) throw new RestaurantError('Invalid table parameter: the parameter is not a Table object.');
        if (this.tables.filter(t => t.id === table.id).length >= 1) return null;
        // throw new RestaurantError("Invalid table parameter: table id already in use.");
        this.tables.push(table);
        return this.tables;
    }

    removeTable(table) {
        if (!this.tables) this.tables = [];
        if (!table) throw new RestaurantError('Invalid table parameter: no null or undefined parameter allowed.');
        if (!(table instanceof Table) && !(typeof table === 'number')) throw new RestaurantError('Invalid table parameter type.');
        if (table instanceof Table) this.tables = this.tables.filter(t => t.id !== table.id);
        if (typeof table === 'number') this.tables = this.tables.filter(t => t.id !== table);
        return this.tables;
    }

    addTables(tablesArr) {
        if (!this.tables) this.tables = [];
        const type = { add: true };
        if (checker.checkTables(tablesArr, type)) return null;
        const tables = tablesArr.filter(x => this.tables.filter(t2 => t2.id === x.id).length < 1);
        this.tables = this.tables.concat(tables);
        return this.tables;
    }

    removeTables(tables) {
        if (!this.tables) this.tables = [];
        const type = { add: false };
        if (checker.checkTables(tables, type)) return null;
        if (typeof tables[0] !== 'number')
            type.table = true;
        if (type.table) {
            this.tables = this.tables
                .filter(t1 => tables.filter(t2 => t1.id === t2.id).length < 1);
        } else
            this.tables = this.tables.filter(t1 => tables.filter(t2 => t1.id === t2).length < 1);
        return this.tables;
    }
}
module.exports = Restaurant;
