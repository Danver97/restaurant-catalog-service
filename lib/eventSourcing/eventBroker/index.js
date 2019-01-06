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
    get: new Property('function', 2),
    hide: new Property('function', 2),
    publish: new Property('function', 2),
    remove: new Property('function', 2),
    subscribe: new Property('function', 2),
};

const broker = eventBrokers[ENV.event_broker || 'redis'] || {};
let pollId = null;

function startPoll(options, eventHandler, ms) {
    pollId = setInterval(() => broker.get(options, eventHandler), ms || 10000);
    return pollId;
}

function stopPoll(id) {
    clearInterval(id || pollId);
    if (!id || pollId === id)
        pollId = null;
}

function ignoreEvent(e, cb) {
    return broker.hide(e, cb);
}

function destroyEvent(e, cb) {
    return broker.remove(e, cb);
}

implem.checkImplementation(interf, broker);

module.exports = Object.assign({ startPoll, stopPoll, ignoreEvent, destroyEvent }, broker);
