const ENV = require('../../src/env');
const testdb = require('../db/testdb');
const dynamodb = require('../db/dynamodb');

const eventStores = {
    testdb,
    dynamodb,
};

// const store = eventStores[ENV.event_store];
const store = require('../db');

/* module.exports = function (broker) {
    if (broker) {
        broker.pickOnNotification(event => {
            store.persist(event);
            store.emit(`${event.topic}:${event.message}`, event);
        });
    }
    return store;
}; */

module.exports = store;
