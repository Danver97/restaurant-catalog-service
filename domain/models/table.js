const RestaurantError = require('../errors/restaurant_error');

class Table {
    constructor(id, restaurantId, people) {
        if (!id || !restaurantId || !people) throw new Error('Invalid Table object constructor parameters.');
        this.id = id;
        this.restaurantId = restaurantId;
        this.people = people;
    }

    static fromObject(obj) {
        const table = new Table(obj.id, obj.restaurantId, obj.people);
        const classKeys = ['id', 'restaurantId', 'people'];
        Object.keys(obj).forEach(k => {
            if (!classKeys.includes(k))
                table[k] = obj[k];
        });
        return table;
    }

    setId(id) {
        if (!id || typeof id !== 'number') throw new RestaurantError('Invalid table id.');
        this.id = id;
    }
}

module.exports = Table;
