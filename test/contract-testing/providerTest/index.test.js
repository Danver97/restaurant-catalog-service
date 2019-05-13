const uuid = require('uuid/v4');
const repo = require('../../../infrastructure/repository/repositoryManager')('testdb');
const Restaurant = require('../../../domain/models/restaurant');
// const testUtils = require('../../test-utils');
const Interactor = require('./utils');

function restaurantCreated() {
    const r = new Restaurant(uuid(), 'Risto', 'Gino'); // testUtils.timeTable, testUtils.tables
    return repo.restaurantCreated(r);
}

const p = new Interactor({
    messageProviders: {
        // restaurantCreated,
    }
});

describe('Consumers contract test', function () {
    this.slow(5000);
    this.timeout(20000);
    it('verify that published events satisfy consumer contracts expectations', function () {
        return p.verify();
    });
});
