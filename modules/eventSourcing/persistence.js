const ENV = require('../../src/env');
const AWSinit = require('../lib/AWS');
// const EventBroker = require('./eventBroker');
const EventStore = require('./eventStore');
/*
const Event = require('./event');
const RestaurantEvents = require('../restaurant-events');
const RestaurantError = require('../../errors/restaurant_error');
*/

let store;
// let broker;

if (ENV.infrastructure === 'AWS')
    AWSinit.init();

if (ENV.node_env === 'test' || ENV.event_broker === ENV.event_store) {
    store = EventStore;
    // broker = store;
} else {
    store = EventStore;
    // broker = EventBroker;
    // broker.subscribe(RestaurantEvents.topic);
}
/*
// Event publishers
// rst
function publishWithOptionalPromise(event, cb) {
    const result = new Promise(async (resolve, reject) => {
        try {
            await broker.publishEvent(event);
            if (cb)
                cb(null, event);
            resolve(event);
        } catch (e) {
            if (cb)
                cb(e);
            reject(e);
        }
    });
    if (cb)
        return null;
    return result;
}

function restaurantCreated(rest, cb) {
    const event = new Event(rest.id, RestaurantEvents.topic, RestaurantEvents.restaurantCreated, rest);
    return publishWithOptionalPromise(event, cb);
}

function restaurantRemoved(rest, cb) {
    const event = new Event(rest.id, RestaurantEvents.topic, RestaurantEvents.restaurantRemoved, { id: rest.id });
    return publishWithOptionalPromise(event, cb);
}

function tableAdded(rest, tables, cb) {
    const event = new Event(rest.id, RestaurantEvents.topic, RestaurantEvents.tableAdded, { tables });
    return publishWithOptionalPromise(event, cb);
}

function tableRemoved(rest, tables, cb) {
    const event = new Event(rest.id, RestaurantEvents.topic, RestaurantEvents.tableRemoved, { tables });
    return publishWithOptionalPromise(event, cb);
}

function getRestaurant(restId, cb) {
    const result = new Promise(async (resolve, reject) => {
        try {
            let err = null;
            const stream = await store.getStream(restId);
            let rest = await store.getSnapshot(restId) || {};
            stream.events.forEach(e => {
                if (e.eventMessage === RestaurantEvents.restaurantRemoved)
                    rest = null;
                try {
                    rest = Object.assign(rest, e.payload);
                } catch (error) {
                    err = new RestaurantError(`Restaurant ${restId} deleted`, 404);
                }
            });
            if (err)
                throw err;
            if (cb)
                cb(null, rest);
            resolve(rest);
        } catch (e) {
            if (cb)
                cb(e);
            reject(e);
        }
    });
    if (cb)
        return null;
    return result;
}
// rcl

*/

const persistence = {
    // broker,
    store,
    // db handlers
    restaurantCreated: store.restaurantCreated,
    restaurantRemoved: store.restaurantRemoved,
    tableAdded: store.tableAdded,
    tableRemoved: store.tableRemoved,
    getRestaurant: store.getRestaurant,
};

module.exports = persistence;
