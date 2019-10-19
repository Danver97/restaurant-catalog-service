const RestaurantError = require('../errors/restaurant_error');
const Table = require('./table');
const Phone = require('./phone');
const Review = require('./review');
const Timetable = require('./timetable').Timetable;
const Menu = require('./menu').Menu;
const checker = require('../../lib/checkers');

class Restaurant {
    constructor(restId, name, owner, timetable, menu, telephone) {
        if (!restId || !name || !owner || !timetable || !menu || !telephone)
            throw new RestaurantError(`Missing the following constructor params:
            ${restId ? '' : 'restId'}${name ? '' : ' name'}${owner ? '' : ' owner'}${timetable ? '' : ' timetable'}${menu ? '' : ' menu'}${telephone ? '' : ' telephone'}`);
        if (!(timetable instanceof Timetable))
            throw new RestaurantError(`The time is not formatted in the right way`);
        if (!(menu instanceof Menu))
            throw new RestaurantError(`The menu is not formatted in the right way`);
        if (!(telephone instanceof Phone)) // TODO: internationalize
            throw new RestaurantError(`telephone is not an instance of Phone`);
        if (typeof owner !== 'string')
            throw new RestaurantError(`The owner value is not formatted in the right way`);
        if (typeof name !== 'string')
            throw new RestaurantError(`The name value is not formatted in the right way`);
        this.restId = restId;
        this.restaurantName = name;
        this.owner = owner;
        this.timetable = timetable;
        this.menu = menu;
        this.telephone = telephone;
        this.tables = [];
    }

    static fromObject(obj) {
        const timetable = Timetable.fromObject(obj.timetable);
        const menu = Menu.fromObject(obj.menu);
        const telephone = new Phone(obj.telephone);
        const rest = new Restaurant(obj.restId, obj.restaurantName, obj.owner, timetable, menu, telephone);
        if (obj.tables)
            rest.addTables(obj.tables.map(t => Table.fromObject(t)));
        const classKeys = ['restId', 'restaurantName', 'owner', 'tables'];
        Object.keys(obj).forEach(k => {
            if (!classKeys.includes(k))
                rest[k] = obj[k];
        });
        return rest;
    }

    setTimetable(timetable) {
        if (!timetable) throw new RestaurantError('Missing the following parameter: timetable');
        if (!(timetable instanceof Timetable)) throw new RestaurantError('timetable');
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
