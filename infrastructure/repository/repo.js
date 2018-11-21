const Restaurant = require('../../domain/models/restaurant');
const restaurantEvents = require('../../lib/restaurant-events');
const Promisify = require('../../lib/utils').promisify;

function restaurantCreated(rest, cb) {
    return Promisify(async () => {
        await this.save(rest.id, rest._revisionId, restaurantEvents.restaurantCreated, Object.assign({}, rest));
        if (rest._revisionId) rest._revisionId++;
    }, cb);
    // return this.save(rest.id, rest._revisionId, restaurantEvents.restaurantCreated, Object.assign({}, rest), cb);
}

function restaurantRemoved(rest, cb) {
    return Promisify(async () => {
        await this.save(rest.id, rest._revisionId, restaurantEvents.restaurantRemoved, { id: rest.id });
        if (rest._revisionId) rest._revisionId++;
    }, cb);
    // return this.save(rest.id, rest._revisionId, restaurantEvents.restaurantRemoved, { id: rest.id }, cb);
}

function tableAdded(rest, tables, cb) {
    return Promisify(async () => {
        await this.save(rest.id, rest._revisionId, restaurantEvents.tableAdded, { id: rest.id, tables: tables.slice() });
        if (rest._revisionId) rest._revisionId++;
    }, cb);
    // return this.save(rest.id, rest._revisionId, restaurantEvents.tableAdded, { id: rest.id, tables: tables.slice() }, cb);
}

function tableRemoved(rest, tables, cb) {
    return Promisify(async () => {
        await this.save(rest.id, rest._revisionId, restaurantEvents.tableRemoved, { id: rest.id, tables: tables.slice() });
        if (rest._revisionId) rest._revisionId++;
    }, cb);
    // return this.save(rest.id, rest._revisionId, restaurantEvents.tableRemoved, { id: rest.id, tables: tables.slice() }, cb);
}

function getRestaurant(restId, cb) {
    return Promisify(async () => {
        const stream = await this.getStream(restId);
        let aggregate = {};
        stream.forEach(e => {
            const payload = e.Payload || e.payload;
            const message = e.Message || e.message;
            aggregate = Object.assign(aggregate, payload); // TODO: OCCHIO QUIIIIII!!!! Conflitto tra Payload per dynamodb e payload per altri db.
            if ((message === restaurantEvents.tableAdded || message === restaurantEvents.tableRemoved) && payload.tables === undefined)
                aggregate.tables = [];
        });
        aggregate._revisionId = stream.length;
        return Restaurant.fromObject(aggregate);
    }, cb);
}

function decorate(db) {
    return Object.assign(db, {
        restaurantCreated: restaurantCreated.bind(db),
        restaurantRemoved: restaurantRemoved.bind(db),
        tableAdded: tableAdded.bind(db),
        tableRemoved: tableRemoved.bind(db),
        getRestaurant: getRestaurant.bind(db),
    });
}

module.exports = decorate;
