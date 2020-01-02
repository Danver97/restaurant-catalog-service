const ESClient = require('@elastic/elasticsearch').Client;
const Promisify = require('promisify-cb');
const writerFunc = require('./writer');

let writer = null;

class Writer {
    constructor(url, indexName) {
        if (!url || !indexName) {
            throw new Error(`WriterError: missing one of the following parameter in the constructor:
            ${url ? '' : 'url'}
            ${indexName ? '' : 'indexName'}`);
        }
        this.url = url;
        this.indexName = indexName;
        this.client = new ESClient({ node: this.url });
    }

    async connect() {
        if (this.client.isConnected())
            return;
        await this.client.connect();
        this.db = this.client.db(this.indexName);
        this.collection = this.db.collection(this.collectionName);
    }

    get isConnected() {
        return this.client.isConnected();
    }

    closeConnection() {
        return this.client.close();
    }

    async close() {
        await this.closeConnection();
    }

    async disconnect() {
        await this.closeConnection();
    }

    /**
     * Ensure client is connected before proceding to sending write operations to the database
     * @param {function} operationCallback Write operation callback
     * @param {Writer~writerCallback} cb Callback for operation callback result
     */
    writeOperation(operationCallback, cb) {
        return Promisify(async () => {
            await this.connect();
            const result = operationCallback();
            if (result instanceof Promise)
                return await result;
            return result;
        }, cb);
    }

    // Write handlers

    restaurantCreated(restaurant, cb) {
        restaurant._id = restaurant.restId || restaurant.id;
        restaurant._revisionId = 1;
        /*
        this.client.index({
            index: this.indexName,
            body: restaurant,
            // refresh: 'wait_for',
        });
        */

        return Promisify(() => this.collection.insertOne(restaurant), cb);
    }

    restaurantRemoved(restaurantId, _revisionId, cb) {
        return Promisify(() => this.collection.deleteOne({ _id: restaurantId, _revisionId }), cb);
    }

    ownerChanged(restaurantId, _revisionId, owner, cb) {
        return Promisify(
            () => this.collection.updateOne(
                { _id: restaurantId, _revisionId },
                { $set: { owner }, $inc: { _revisionId: 1 } },
            ),
            cb,
        );
    }
    
    tableAdded(restaurantId, _revisionId, tables, cb) {
        return this.tablesChanged(restaurantId, _revisionId, tables, cb);
    }

    tableRemoved(restaurantId, _revisionId, tables, cb) {
        return this.tablesChanged(restaurantId, _revisionId, tables, cb);
    }
    
    tablesChanged(restaurantId, _revisionId, tables, cb) {
        return Promisify(
            () => this.collection.updateOne(
                { _id: restaurantId, _revisionId },
                { $set: { tables }, $inc: { _revisionId: 1 } },
            ),
            cb,
        );
    }

    timetableChanged(restaurantId, _revisionId, timetable, cb) {
        return Promisify(
            () => this.collection.updateOne(
                { _id: restaurantId, _revisionId },
                { $set: { timetable }, $inc: { _revisionId: 1 } },
            ),
            cb,
        );
    }

    menuChanged(restaurantId, _revisionId, menu, cb) {
        return Promisify(
            () => this.collection.updateOne(
                { _id: restaurantId, _revisionId },
                { $set: { menu }, $inc: { _revisionId: 1 } },
            ),
            cb,
        );
    }

    menuSectionAdded(restaurantId, _revisionId, menu, cb) {
        return this.menuChanged(restaurantId, _revisionId, menu, cb);
    }

    menuSectionRemoved(restaurantId, _revisionId, menu, cb) {
        return this.menuChanged(restaurantId, _revisionId, menu, cb);
    }

    dishAdded(restaurantId, _revisionId, menu, cb) {
        return this.menuChanged(restaurantId, _revisionId, menu, cb);
    }

    dishRemoved(restaurantId, _revisionId, menu, cb) {
        return this.menuChanged(restaurantId, _revisionId, menu, cb);
    }

    dishUpdated(restaurantId, _revisionId, menu, cb) {
        return this.menuChanged(restaurantId, _revisionId, menu, cb);
    }
}

/**
 * @callback Writer~writerCallback
 * @param {object} error Error object
 * @param {any} response Response of the operation
 */

/**
 * Export function for the writer singleton object
 * @param {object} options Export function options
 * @param {object} options.url Url string for the ElasticSearch instance
 * @param {object} options.indexName Index name of ElasticSearch
 */
async function exportFunc(options) {
    function areSameOptions(options) {
        return options.url === writer.url && options.indexName === writer.indexName;
    }

    if (!options || (writer && writer.isConnected && areSameOptions(options)))
        return writer;
    writer = new Writer(options.url, options.indexName);
    await writer.connect();
    return writer;
}

module.exports = exportFunc;
