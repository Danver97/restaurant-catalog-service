const uuid = require('uuid/v4');
const restUtils = require('../../lib/restaurant-test.lib');

const defaultRestId = '52db11c3-ffed-489e-984b-ef2972f56d8f';
const defaultUserId = 'c398ffa9-4cdd-4068-b3af-519b3b2e95b7';

function restaurant(streamId, userId) {
    return {
        _id: defaultRestId || streamId,
        restId: defaultRestId || streamId,
        owner: defaultUserId || userId,
        tables: restUtils.defaultTables1,
        timetable: restUtils.defaultTimetable,
        telephone: restUtils.defaultPhone,
        menu: restUtils.defaultMenu,
        _revisionId: 1,
    };
}

module.exports = {
    restaurant,
};
