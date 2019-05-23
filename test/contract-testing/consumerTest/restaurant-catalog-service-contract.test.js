const repo = require('../../../infrastructure/repository/repositoryManager')('testdb');
const Restaurant = require('../../../domain/models/restaurant');
// const testUtils = require('../../test-utils');
const eventContent = require('./eventContent');
const Interactor = require('./utils');

const interactor = new Interactor({
    consumer: 'restaurant-catalog-service',  // TODO: parametrize
    provider: 'restaurant-catalog-service',
});

describe('Restaurant Service Contract Testing', function () {
    this.slow(5000);
    this.timeout(10000);
    const restId = '24071e32-263f-45cc-81b9-f4acac75fb1d';
    const r = new Restaurant(restId, 'Risto', 'Gino'); // testUtils.timeTable, testUtils.tables

    beforeEach(() => repo.reset());

    it('eventName is handled properly', () => {
        const state = 'a state';
        const eventName = 'eventName';
        // const content = eventContent.restaurantCreatedEvent(restId, 'gino');
        // return interactor.defineAsyncInteraction(state, eventName, content);
    });

    after(() => interactor.publishPacts());
});
