const restUtils = require('../../lib/restaurant-test.lib');

const defaultRestId = '52db11c3-ffed-489e-984b-ef2972f56d8f';
const defaultUserId = 'c398ffa9-4cdd-4068-b3af-519b3b2e95b7';

function restaurant(streamId, userId) {
    return {
        restId: defaultRestId || streamId,
        owner: defaultUserId || userId,
        tables: restUtils.defaultTables1,
        timetable: restUtils.defaultTimetable,
        telephone: restUtils.defaultPhone,
        menu: restUtils.defaultMenu,
    };
}

function toJSON(obj) {
    return JSON.parse(JSON.stringify(obj));
}

class Client {
    constructor (client, index) {
        this.client = client;
        this.index = index;
    }

    async search(id, verbose) {
        const res = await this.client.search({
            index: this.index,
            q: `_id: ${id}`,
        });
        if (verbose) console.log(res.body);
        if (res.body.hits.hits.length == 0)
            return { body: null };
        return { body: res.body.hits.hits[0]._source };
    }
    
    insertOne(rest) {
        return this.client.index({
            index: this.index,
            id: rest.restId,
            body: rest,
        });
    }
    
    update(id, doc) {
        return this.client.update({
            index: this.index,
            id,
            body: { doc },
        });
    }

    delete(id) {
        return this.client.delete({ index: this.index, id });
    }
    
    refresh() {
        return this.client.indices.refresh({ index: this.index });
    }
}

module.exports = {
    toJSON,
    Client,
    restaurant,
    defaultTables1: restUtils.defaultTables1,
    defaultTables2: restUtils.defaultTables2,
    defaultTables3: restUtils.defaultTables3,
    defaultTimetables1: restUtils.defaultTimetable,
    defaultTimetables2: restUtils.defaultTimetable2,
    defaultMenu1: restUtils.defaultMenu,
    defaultMenu2: restUtils.defaultMenu2,
    defaultMenu3: restUtils.defaultMenu3,
    defaultLocation: restUtils.defaultLocation,
};