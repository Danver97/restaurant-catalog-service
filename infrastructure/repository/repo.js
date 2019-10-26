const Promisify = require('promisify-cb');
const Restaurant = require('../../domain/models/restaurant');
const restaurantEvents = require('../../lib/restaurant-events');
const RepositoryError = require('../errors/repo_error');

async function saveEvent(db, streamId, eventId, message, payload) {
    try {
        await db.save(streamId, eventId, message, payload);
    } catch (e) {
        if (e.code === 'cazzo ne so')
            throw new RepositoryError('RepositoryError: Aggregate not up to date', 401);
    }
}

function restaurantCreated(rest, cb) {
    return Promisify(async () => {
        const payload = Object.assign({}, rest);
        const e = await this.save(rest.restId, rest._revisionId, restaurantEvents.restaurantCreated, Object.assign({}, rest));
        if (rest._revisionId) rest._revisionId++;
        return e;
    }, cb);
    // return this.save(rest.restId, rest._revisionId, restaurantEvents.restaurantCreated, Object.assign({}, rest), cb);
}

function restaurantRemoved(rest, cb) {
    return Promisify(async () => {
        await this.save(rest.restId, rest._revisionId, restaurantEvents.restaurantRemoved, { id: rest.restId, status: 'removed' });
        if (rest._revisionId) rest._revisionId++;
    }, cb);
    // return this.save(rest.restId, rest._revisionId, restaurantEvents.restaurantRemoved, { id: rest.restId }, cb);
}

function tableAdded(rest, tables, cb) {
    return Promisify(async () => {
        await this.save(rest.restId, rest._revisionId, restaurantEvents.tableAdded, { id: rest.restId, tables: tables.slice() });
        if (rest._revisionId) rest._revisionId++;
    }, cb);
    // return this.save(rest.restId, rest._revisionId, restaurantEvents.tableAdded, { id: rest.restId, tables: tables.slice() }, cb);
}

function tableRemoved(rest, tables, cb) {
    return Promisify(async () => {
        await this.save(rest.restId, rest._revisionId, restaurantEvents.tableRemoved, { id: rest.restId, tables: tables.slice() });
        if (rest._revisionId) rest._revisionId++;
    }, cb);
    // return this.save(rest.restId, rest._revisionId, restaurantEvents.tableRemoved, { id: rest.restId, tables: tables.slice() }, cb);
}

function tablesChanged(rest, tables, cb) {
    return Promisify(async () => {
        await this.save(rest.restId, rest._revisionId, restaurantEvents.tablesChanged, { id: rest.restId, tables: tables.slice() });
        if (rest._revisionId) rest._revisionId++;
    }, cb);
}

function timetableChanged(rest, timetable, cb) {
    return Promisify(async () => {
        await this.save(rest.restId, rest._revisionId, restaurantEvents.timetableChanged, { id: rest.restId, timetable });
        if (rest._revisionId) rest._revisionId++;
    }, cb);
}

function menuSectionAdded(rest, menu, cb) {
    return Promisify(async () => {
        await this.save(rest.restId, rest._revisionId, restaurantEvents.menuSectionAdded, { id: rest.restId, menu });
        if (rest._revisionId) rest._revisionId++;
    }, cb);
}

function menuSectionRemoved(rest, menu, cb) {
    return Promisify(async () => {
        await this.save(rest.restId, rest._revisionId, restaurantEvents.menuSectionRemoved, { id: rest.restId, menu });
        if (rest._revisionId) rest._revisionId++;
    }, cb);
}

function dishAdded(rest, menu, cb) {
    return Promisify(async () => {
        await this.save(rest.restId, rest._revisionId, restaurantEvents.dishAdded, { id: rest.restId, menu });
        if (rest._revisionId) rest._revisionId++;
    }, cb);
}

function dishRemoved(rest, menu, cb) {
    return Promisify(async () => {
        await this.save(rest.restId, rest._revisionId, restaurantEvents.dishRemoved, { id: rest.restId, menu });
        if (rest._revisionId) rest._revisionId++;
    }, cb);
}

function dishUpdated(rest, menu, cb) {
    return Promisify(async () => {
        await this.save(rest.restId, rest._revisionId, restaurantEvents.dishUpdated, { id: rest.restId, menu });
        if (rest._revisionId) rest._revisionId++;
    }, cb);
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
        tablesChanged: tablesChanged.bind(db),

        timetableChanged: timetableChanged.bind(db),

        menuSectionAdded: menuSectionAdded.bind(db),
        menuSectionRemoved: menuSectionRemoved.bind(db),
        dishAdded: dishAdded.bind(db),
        dishRemoved: dishRemoved.bind(db),
        dishUpdated: dishUpdated.bind(db),

        getRestaurant: getRestaurant.bind(db),
    });
}

module.exports = decorate;
