const redis = require('redis-event-broker');
const sqs = require('./sqs');
const testbroker = require('./testbroker');
const implem = require('../../implements');
const ENV = require('../../../src/env');

const Property = implem.Property;

const eventBrokers = {
    redis: ENV.node_env === 'test_event_sourcing' && ENV.event_broker === 'redis' ? redis({}) : undefined,
    sqs,
    testbroker,
};

const interf = {
    get: new Property('function', 1),
    hide: new Property('function', 2),
    remove: new Property('function', 2),
    subscribe: new Property('function', 2),
};

const broker = eventBrokers[ENV.event_broker || 'redis'] || {};

function poll(eventHandler, ms) {
    setInterval(() => broker.get(eventHandler), ms || 10000);
}

function ignoreEvent(e, cb) {
    return broker.hide(e, cb);
}

function destroyEvent(e, cb) {
    return broker.remove(e, cb);
}

implem.checkImplementation(interf, broker);

module.exports = Object.assign({ poll, ignoreEvent, destroyEvent }, broker);
