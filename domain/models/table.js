const RestaurantError = require('../errors/restaurant.error');

class Table {
    constructor(id, people) {
        if (!id || !people)
            throw new Error(`Missing Table constructor parameters:${id ? '' : ' id'}${people ? '' : ' people'}`);
        if (typeof id !== 'string')
            throw new RestaurantError('id must be a string');
        if (typeof people !== 'number')
            throw new RestaurantError('people must be a number');
        this.id = id;
        this.people = people;
    }

    static fromObject(obj) {
        const table = new Table(obj.id, obj.people);
        const classKeys = ['id', 'people'];
        Object.keys(obj).forEach(k => {
            if (!classKeys.includes(k))
                table[k] = obj[k];
        });
        return table;
    }

    setId(id) {
        if (typeof id !== 'string') throw new RestaurantError('Invalid table id.');
        this.id = id;
    }
}

module.exports = Table;
