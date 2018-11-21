const ENV = require('../../src/env');
const implem = require('../../lib/implements');
const dbs = require('../../lib/eventSourcing/eventStore');
const repoImpl = require('./repo');

const Property = implem.Property;

const interf = {
    restaurantCreated: new Property('function', 2),
    restaurantRemoved: new Property('function', 2),
    tableAdded: new Property('function', 3),
    tableRemoved: new Property('function', 3),
    getRestaurant: new Property('function', 2),
};

function exportFunc(db) {
    let repo;
    if (!db)
        repo = repoImpl(dbs[ENV.event_store]);
    else
        repo = repoImpl(dbs[db]);
    implem.checkImplementation(interf, repo);
    return repo;
}

module.exports = exportFunc;
