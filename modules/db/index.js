const ENV = require('../../src/env');
const Promisify = require('../../lib/utils').promisify;
const Restaurant = require('../../models/restaurant');
const restaurantEvents = require('../restaurant-events');

const dynamodb = require('./dynamodb');
const testdb = require('./testdb');

const dbs = {
    dynamodb,
    testdb,
};

const db = dbs[ENV.event_store];


function restaurantCreated(rest, cb) {
    return Promisify(async () => {
        await db.save(rest.id, rest._revisionId, restaurantEvents.restaurantCreated, Object.assign({}, rest), cb);
        rest._revisionId++;
    }, cb);
    // return db.save(rest.id, rest._revisionId, restaurantEvents.restaurantCreated, Object.assign({}, rest), cb);
}

function restaurantRemoved(rest, cb) {
    return Promisify(async () => {
        await db.save(rest.id, rest._revisionId, restaurantEvents.restaurantRemoved, { id: rest.id }, cb);
        rest._revisionId++;
    }, cb);
    // return db.save(rest.id, rest._revisionId, restaurantEvents.restaurantRemoved, { id: rest.id }, cb);
}

function tableAdded(rest, tables, cb) {
    return Promisify(async () => {
        await db.save(rest.id, rest._revisionId, restaurantEvents.tableAdded, { id: rest.id, tables: tables.slice() }, cb);
        rest._revisionId++;
    }, cb);
    // return db.save(rest.id, rest._revisionId, restaurantEvents.tableAdded, { id: rest.id, tables: tables.slice() }, cb);
}

function tableRemoved(rest, tables, cb) {
    return Promisify(async () => {
        await db.save(rest.id, rest._revisionId, restaurantEvents.tableRemoved, { id: rest.id, tables: tables.slice() }, cb);
        rest._revisionId++;
    }, cb);
    // return db.save(rest.id, rest._revisionId, restaurantEvents.tableRemoved, { id: rest.id, tables: tables.slice() }, cb);
}

function getRestaurant(restId, cb) {
    return Promisify(async () => {
        const stream = await db.getStream(restId);
        let aggregate = {};
        stream.forEach(e => {
            aggregate = Object.assign(aggregate, e.Payload || e.payload); // TODO: OCCHIO QUIIIIII!!!! Conflitto tra Payload per dynamodb e payload per altri db.
        });
        aggregate._revisionId = stream.length - 1;
        // console.log(aggregate);
        return Restaurant.fromObject(aggregate);
    }, cb);
}


module.exports = {
    restaurantCreated,
    restaurantRemoved,
    tableAdded,
    tableRemoved,
    getRestaurant,
};
