const Table = require('../domain/models/table');
const RestaurantError = require('../domain/errors/restaurant_error');

function checkRestId(restId) {
    if (!restId) throw new RestaurantError('Invalid restId method param: should be number.');
}

function checkTable(table) {
    if (!(table instanceof Table) && (typeof table !== 'number'))
        throw new RestaurantError('Invalid table method param: should be instance of Table or number.');
}

function checkTables(tables, type) {
    type = type || {};
    if (!Array.isArray(tables)) throw new RestaurantError('Invalid tablesAdded() <tables> method param: should be array.');
    if (tables.length === 0) return true;
    if (type.add && !(tables[0] instanceof Table))
        throw new RestaurantError('Invalid tablesAdded() <tables> method param: should be array of Table or array of number.');
    else if (!type.add && !(tables[0] instanceof Table) && typeof tables[0] !== 'number')
        throw new RestaurantError('Invalid tablesAdded() <tables> method param: should be array of Table or array of number.');
    return false;
}

function convertToTableArr(arr) {
    if (!Array.isArray(arr)) throw new RestaurantError('\'arr\' is not an array.');
    if (arr.length > 0 && !(arr[0] instanceof Table))
        return arr.map(t => new Table(t.id, t.restaurantId, t.people));
    return arr;
}

module.exports = {
    checkRestId,
    checkTable,
    checkTables,
    convertToTableArr,
};
