const Promisify = require('promisify-cb');

const dependencies = {
    db: null,
    collection: null,
};

function restaurantCreated(restaurant, cb) {
    restaurant._id = restaurant.restId;
    restaurant._revisionId = 1;
    return Promisify(() => dependencies.collection.insertOne(restaurant), cb);
}

function ownerChanged(restaurantId, _revisionId, owner, cb) {
    return Promisify(
        () => dependencies.collection.updateOne({ _id: restaurantId, _revisionId }, { $set: { owner }, $inc: { _revisionId: 1 } }),
        cb,
    );
}

function tablesChanged(restaurantId, _revisionId, tables, cb) {
    return Promisify(
        () => dependencies.collection.updateOne({ _id: restaurantId, _revisionId }, { $set: { tables }, $inc: { _revisionId: 1 } }),
        cb,
    );
}

function tableAdded(restaurantId, _revisionId, tables, cb) {
    return tablesChanged(restaurantId, _revisionId, tables, cb);
}

function tableRemoved(restaurantId, _revisionId, tables, cb) {
    return tablesChanged(restaurantId, _revisionId, tables, cb);
}

function tablesAdded(restaurantId, _revisionId, tables, cb) {
    return tablesChanged(restaurantId, _revisionId, tables, cb);
}

function tablesRemoved(restaurantId, _revisionId, tables, cb) {
    return tablesChanged(restaurantId, _revisionId, tables, cb);
}

const exportObj = {
    restaurantCreated,
    ownerChanged,
    tableAdded,
    tableRemoved,
    tablesAdded,
    tablesRemoved,
};

async function exportFunc(db) {
    dependencies.db = db;
    dependencies.collection = db.collection('Restaurant');
    return exportObj;
}

module.exports = exportFunc;
