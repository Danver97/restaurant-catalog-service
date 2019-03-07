const dbs = require('@danver97/event-sourcing/eventStore');
const implem = require('implemented');
const ENV = require('../../src/env');
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
    console.log(`Repo started with: ${db || ENV.event_store}`);
    return repo;
}

module.exports = exportFunc;
