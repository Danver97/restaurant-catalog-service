const EventEmitter = require('events');
const uuidv1 = require('uuid/v1');
const restaurantEvents = require('../restaurant-events');
const Restaurant = require('../../models/restaurant');
const RestaurantError = require('../../errors/restaurant_error');
const Promisify = require('../../lib/utils').promisify;

// let eventStore = [];
let eventStore = {};
let snapshots = {};
const emitter = new EventEmitter();

function save(streamId, eventId, message, payload, cb) {
    /* eventStore.push(elem);
    if (cb) { cb(null, elem); } */
    return Promisify(() => {
        delete payload._revisionId;
        if (!streamId)
            streamId = uuidv1();
        if (!eventStore[streamId])
            eventStore[streamId] = { streamId, revision: 0, events: [] };
        const revision = eventStore[streamId].revision;
        const event = {
            streamId,
            topic: restaurantEvents.topic,
            eventId: eventId || eventStore[streamId].events.length,
            created: new Date(),
            eventMessage: message,
            payload,
        };
        // eventStore.push(event);
        if (revision === eventStore[streamId].revision) {
            eventStore[streamId].events.push(event);
            eventStore[streamId].revision++;
        } else
            throw new Error('Stream revision not syncronized.');
        emit(`${event.topic}:${event.message}`, payload);
        return event;
    }, cb);
}
    
function emit(message, payload) {
    emitter.emit(message, payload);
}
    
function on(message, cb) {
    emitter.on(message, cb);
}

function persist(event, cb) {
    return save(event.streamId, event.id, event.message, event.payload, cb);
}

function publishEvent(event) {
    return persist(event);
}

function getStream(streamId, cb) {
    const result = new Promise(resolve => {
        console.log(eventStore[streamId].events);
        if (cb)
            cb(eventStore[streamId].events);
        resolve(eventStore[streamId].events);
    });
    if (cb)
        return null;
    return result;
}

function getSnapshot(aggregateId, cb) {
    const result = new Promise(resolve => {
        if (cb)
            cb(snapshots[aggregateId]);
        resolve(snapshots[aggregateId]);
    });
    if (cb)
        return null;
    return result;
}

function restaurantCreated(rest, cb) {
    return save(rest.id, rest._revisionId, restaurantEvents.restaurantCreated, Object.assign({}, rest), cb);
}

function restaurantRemoved(rest, cb) {
    return save(rest.id, rest._revisionId, restaurantEvents.restaurantRemoved, { id: rest.id }, cb);
}

function tableAdded(rest, tables, cb) {
    return save(rest.id, rest._revisionId, restaurantEvents.tableAdded, { id: rest.id, tables: tables.slice() }, cb);
}

function tableRemoved(rest, tables, cb) {
    return save(rest.id, rest._revisionId, restaurantEvents.tableRemoved, { id: rest.id, tables: tables.slice() }, cb);
}

function getRestaurant(restId, cb) {
    return Promisify(() => {
        let err;
        const events = eventStore[restId].events;
        // console.log(events);
        const created = events.filter(e => e.eventMessage === restaurantEvents.restaurantCreated)
            .map(e => e.payload).filter(r => r.id == restId);
        const deleted = events.filter(e => e.eventMessage === restaurantEvents.restaurantRemoved)
            .map(e => e.payload).filter(r => r.id == restId);
        
        if (deleted.length >= 1)
            throw new RestaurantError(`Restaurant ${restId} deleted`, 404);
        const rest = created[0];
        if (!rest)
            throw new RestaurantError(`No such restaurant with ${restId}`, 404);
        
        let tables = [];
        const lastEventTables = events.filter(e => (e.eventMessage === restaurantEvents.tableAdded 
                                                    || e.eventMessage === restaurantEvents.tableRemoved) && e.payload.id === restId);
        if (lastEventTables.length > 0)
            tables = lastEventTables[lastEventTables.length - 1].payload.tables;
        rest.tables = tables;
        rest._revisionId = events.length - 1;
        
        return Restaurant.fromObject(rest);
    }, cb);
}

function reset() {
    // eventStore = [];
    eventStore = {};
    snapshots = {};
}

function resetEmitter() {
    emitter.eventNames().forEach(e => emitter.removeAllListeners(e));
}

module.exports = {
    save,
    restaurantCreated,
    restaurantRemoved,
    tableAdded,
    tableRemoved,
    getRestaurant,
    persist,
    publishEvent,
    emit,
    on,
    getStream,
    getSnapshot,
    reset,
    resetEmitter,
};
