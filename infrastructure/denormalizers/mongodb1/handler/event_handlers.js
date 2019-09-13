const Promisify = require('promisify-cb');

const dependencies = {
    db: null,
};

function restaurantCreated(e) {
    return Promisify(async () => {
        const db = dependencies.db;
        await db.restaurantCreated(e.payload);
    });
}

function ownerChanged(e) {
    return Promisify(async () => {
        const db = dependencies.db;
        await db.ownerChanged(e.streamId, e.eventId - 1, e.payload.owner);
    });
}

function tableAdded(e) {
    return Promisify(async () => {
        const db = dependencies.db;
        await db.tableAdded(e.streamId, e.eventId - 1, e.payload.tables);
    });
}

function tableRemoved(e) {
    return Promisify(async () => {
        const db = dependencies.db;
        await db.tableRemoved(e.streamId, e.eventId - 1, e.payload.tables);
    });
}

function tablesAdded(e) {
    return Promisify(async () => {
        const db = dependencies.db;
        await db.tablesAdded(e.streamId, e.eventId - 1, e.payload.tables);
    });
}

function tablesRemoved(e) {
    return Promisify(async () => {
        const db = dependencies.db;
        await db.tablesRemoved(e.streamId, e.eventId - 1, e.payload.tables);
    });
}

async function handler(e, ack) {
    if (!e)
        return;
    switch (e.message) {
        case 'restaurantCreated':
            await restaurantCreated(e);
            ack();
            break;
        case 'ownerChanged':
            await ownerChanged(e);
            ack();
            break;
        case 'tableAdded':
            await tableAdded(e);
            ack();
            break;
        case 'tableRemoved':
            await tableRemoved(e);
            ack();
            break;
        case 'tablesAdded':
            await tablesAdded(e);
            ack();
            break;
        case 'tablesRemoved':
            await tablesRemoved(e);
            ack();
            break;
        default:
    }
}


/* const exportObj = {
    restaurantCreated,
    ownerChanged,
    tableAdded,
    tableRemoved,
    tablesAdded,
    tablesRemoved,
}; */

function exportFunc(db) {
    dependencies.db = db;
    return handler;
}

module.exports = exportFunc;
