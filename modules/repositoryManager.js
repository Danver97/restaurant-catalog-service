const ENV = require('../src/env');
const persistence = require('./eventSourcing/persistence');
const testdb = require('./db/testdb');

let dbmanager;
if (ENV.node_env === 'test')
    dbmanager = testdb;
if (ENV.node_env === 'test_event_sourcing')
    dbmanager = persistence;

const implem = require('./implements');

const Property = implem.Property;

const interf = {
    restaurantCreated: new Property('function', 2),
    restaurantRemoved: new Property('function', 2),
    tableAdded: new Property('function', 3),
    tableRemoved: new Property('function', 3),
    getRestaurant: new Property('function', 2),
};

implem.checkImplementation(interf, dbmanager);

module.exports = dbmanager;
