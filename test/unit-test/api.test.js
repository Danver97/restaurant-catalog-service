const assert = require('assert');
const uuid = require('uuid/v4');
const request = require('supertest');
const cloneDeep = require('lodash.clonedeep');
const MongoClient = require('mongodb').MongoClient;
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const testbroker = require('@danver97/event-sourcing/eventBroker')['testbroker'];
const BrokerEvent = require('@danver97/event-sourcing/eventBroker/brokerEvent');

const repo = require('../../infrastructure/repository/repositoryManager')('testdb');
const businessManager = require('../../domain/logic/restaurantManager')(repo);
const queryManagerFunc = require('../../infrastructure/query');
const appFunc = require('../../infrastructure/api/api');
const assertStrictEqual = require('../../lib/utils').assertStrictEqual;
const denormHandlerFunc = require('../../infrastructure/denormalizers/mongodb/handler');
const denormWriterFunc = require('../../infrastructure/denormalizers/mongodb/writer');
const denormOrderCtrl = require('../../infrastructure/denormalizers/mongodb/orderControl')('testdb');

const menuLib = require('../../domain/models/menu');
const Table = require('../../domain/models/table');
const Restaurant = require('../../domain/models/restaurant');
const lib = require('./lib/restaurant-test.lib');

const MenuSection = menuLib.MenuSection;
const Dish = menuLib.Dish;
const Price = menuLib.Price;


const mongod = new MongoMemoryServer();
const dbName = 'Restaurant';
const collectionName = 'Restaurant';

let app;
let queryMgr;
let req;

let denormWriter;
let denormHandler;

function waitAsync(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function setUpMongo() {
    const connString = await mongod.getConnectionString();
    mongodb = new MongoClient(connString, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongodb.connect();
    collection = mongodb.db(dbName).collection(collectionName);
}
async function setUpQuery() {
    const connString = await mongod.getConnectionString();
    queryMgr = await queryManagerFunc(connString, dbName, collectionName);
}
async function setUpDenormalizer() {
    const connString = await mongod.getConnectionString();
    denormWriter = await denormWriterFunc({url: connString, db: dbName, collection: collectionName});
    denormHandler = await denormHandlerFunc(denormWriter, denormOrderCtrl, 'warn');

    await testbroker.subscribe('microservice-test');
}

async function processEvents(waitTimeout) {
    await testbroker.getEvent({ number: 10 }, async (err, events) => {
        if (Array.isArray(events)) {
            for (let e of events)
                await denormHandler.handleEvent(e, () => testbroker.destroyEvent(e));
        }
    });
    await waitAsync(waitTimeout || 1); // Needed
}

function stopDenormalizer() {
    testbroker.stopPoll();
}

describe('Integration test', function () {

    before(async function () {
        this.timeout(20000);
        repo.reset();
        await setUpMongo();
        await setUpQuery();
        await setUpDenormalizer();
        app = appFunc(businessManager, queryMgr);
        req = request(app);
    });

    after(async function () {
        this.timeout(20000);
        await waitAsync(200);
        stopDenormalizer();
        await mongod.stop();
    });
    
    it('service test', async function () {
        await req.get('/restaurant-catalog-service')
            .expect(JSON.stringify({
                service: 'restaurant-catalog-service',
            }));
    });
    
    context('Create and destroy restaurant', function () {
        const name = 'I quattro cantoni';
        const owner = 'Giacomo';
        const rest = new Restaurant(uuid(), name, owner, lib.defaultTimetable, lib.defaultMenu, lib.defaultPhone);
        
        it('POST\t/restaurant-catalog-service/restaurants', async function () {
            await req.post('/restaurant-catalog-service/restaurants')
                .set('Content-Type', 'application/json')
                // .send({ restId: rest.restId })
                .send({ restaurantName: rest.restaurantName })
                .send({ owner: rest.owner })
                .send({ timetable: Object.values(rest.timetable.days) })
                .send({ menu: rest.menu.toJSON() })
                .send({ telephone: rest.telephone.toJSON() })
                .expect(res => {
                    rest.restId = res.body.restId;
                })
                .expect(200);
            await processEvents();
        });
        
        it(`GET\t/restaurant-catalog-service/restaurants/${rest.restId}`, async function () {
            await req.get(`/restaurant-catalog-service/restaurants/${rest.restId}`)
                .expect(res => {
                    const result = res.body;
                    // result.restId = parseInt(result.restId, 10);
                    const expected = JSON.parse(JSON.stringify(rest));
                    // assert.deepStrictEqual(result, expected);
                    assertStrictEqual(result, expected);
                })
                .expect(200);
        });
        it('POST\t/restaurant-catalog-service/restaurant/remove', async function () {
            await req.post('/restaurant-catalog-service/restaurant/remove')
                .set('Content-Type', 'application/json')
                .send({ restId: rest.restId })
                .expect({ message: 'success' })
                .expect(200);
            await processEvents();
        });
        
        it(`GET\t/restaurant-catalog-service/restaurants/${rest.restId}`, async function () {
            await req.get(`/restaurant-catalog-service/restaurants/${rest.restId}`)
                .expect(404);
        });
    });
    
    context('Add and remove tables from restaurant', function () {
        const name = 'I quattro cantoni';
        const owner = 'Giacomo';
        const rest = new Restaurant(uuid(), name, owner, lib.defaultTimetable, lib.defaultMenu, lib.defaultPhone);
        const menuSection = new MenuSection(1, 'Section x');
        const dish = new Dish('Fruit Mix', new Price(7.99, 'EUR'), 'A fruit mix', ['banana', 'strawberry']);
        const dish_v2 = new Dish('Fruit Mix', new Price(8.99, 'EUR'));
        const table = new Table(uuid(), 4);
        const table2 = new Table(uuid(), 4);
        
        it('POST\t/restaurant-catalog-service/restaurants', async function () {
            await req.post('/restaurant-catalog-service/restaurants')
                .set('Content-Type', 'application/json')
                .send({ restaurantName: rest.restaurantName })
                .send({ owner: rest.owner })
                .send({ timetable: Object.values(rest.timetable.days) })
                .send({ menu: rest.menu.toJSON() })
                .send({ telephone: rest.telephone.toJSON() })
                .expect(res => {
                    rest.restId = res.body.restId;
                })
                .expect(200);
            await processEvents();
        });
        
        it(`GET\t/restaurant-catalog-service/restaurants/${rest.restId}/tables`, async function () {
            await req.get(`/restaurant-catalog-service/restaurants/${rest.restId}/tables`)
                .expect(res => {
                    const result = res.body;
                    assert.strictEqual(Array.isArray(result), true);
                    assert.strictEqual(result.length, 0);
                })
                .expect(200);
        });
        
        it(`POST\t/restaurant-catalog-service/restaurants/${rest.restId}/tables`, async function () {
            await req.post(`/restaurant-catalog-service/restaurants/${rest.restId}/tables`)
                .set('Content-Type', 'application/json')
                .send(table)
                .expect({})
                .expect(301);
            await processEvents();
            await req.get(`/restaurant-catalog-service/restaurants/${rest.restId}/tables`)
                .expect(res => {
                    const result = res.body;
                    assert.strictEqual(Array.isArray(result), true);
                    assert.strictEqual(result.length, 1);
                    assert.strictEqual(JSON.stringify(result), JSON.stringify([table]));
                })
                .expect(200);
            await req.post(`/restaurant-catalog-service/restaurants/${rest.restId}/tables`)
                .set('Content-Type', 'application/json')
                .send(table2)
                .expect({})
                .expect(301);
            await processEvents();
        });
        
        it('DELETE\t/restaurant-catalog-service/restaurants/${rest.restId}/tables/${tableId}', async function () {
            await req.delete(`/restaurant-catalog-service/restaurants/${rest.restId}/tables/${table.id}`)
                .set('Content-Type', 'application/json')
                .expect({})
                .expect(301);
            await req.delete(`/restaurant-catalog-service/restaurants/${rest.restId}/tables/${table2.id}`)
                .set('Content-Type', 'application/json')
                .expect({})
                .expect(301);
            await processEvents();

            await req.get(`/restaurant-catalog-service/restaurants/${rest.restId}/tables`)
                .expect(res => {
                    const result = res.body;
                    assert.strictEqual(Array.isArray(result), true);
                    assert.strictEqual(result.length, 0);
                    assert.strictEqual(JSON.stringify(result), JSON.stringify([]));
                })
                .expect(200);
        });
        
        it(`PUT\t/restaurant-catalog-service/restaurants/${rest.restId}/tables`, async function () {
            await req.put(`/restaurant-catalog-service/restaurants/${rest.restId}/tables`)
                .set('Content-Type', 'application/json')
                .send([table, table2])
                .expect({})
                .expect(301);
            await processEvents();

            await req.get(`/restaurant-catalog-service/restaurants/${rest.restId}/tables`)
                .expect(res => {
                    const result = res.body;
                    assert.strictEqual(Array.isArray(result), true);
                    assert.strictEqual(result.length, 2);
                    assert.strictEqual(JSON.stringify(result), JSON.stringify([table, table2]));
                })
                .expect(200);
        });

        it(`POST\t/restaurant-catalog-service/restaurants/${rest.restId}/timetables`, async function () {
            const defaultTimetable2 = cloneDeep(lib.defaultTimetable2);
            const timetable2 = cloneDeep(defaultTimetable2);
            delete timetable2.days[1];
            await req.post(`/restaurant-catalog-service/restaurants/${rest.restId}/timetables`)
                .set('Content-Type', 'application/json')
                .expect(400);
            await req.post(`/restaurant-catalog-service/restaurants/${rest.restId}/timetables`)
                .set('Content-Type', 'application/json')
                .send({ timetable: timetable2.toJSON() })
                .expect(400);
            await req.post(`/restaurant-catalog-service/restaurants/${rest.restId}/timetables`)
                .set('Content-Type', 'application/json')
                .send({ timetable: defaultTimetable2.toJSON() })
                .expect({})
                .expect(200);
            await processEvents();
            
            await req.get(`/restaurant-catalog-service/restaurants/${rest.restId}`)
                .expect(res => {
                    const result = res.body;
                    assert.deepStrictEqual(result.timetable, JSON.parse(JSON.stringify(defaultTimetable2)));
                })
                .expect(200);
        });

        it(`GET\t/restaurant-catalog-service/restaurants/${rest.restId}/menu`, async function () {
            
            await req.get(`/restaurant-catalog-service/restaurants/${rest.restId}/menu`)
                .expect(res => {
                    const menu = res.body;
                    const expected = JSON.parse(JSON.stringify(rest.menu));
                    assert.deepStrictEqual(menu, expected);
                })
                .expect(200);
        });

        it(`POST\t/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections`, async function () {
            
            const menuSectionErr = Object.assign({}, menuSection);
            delete menuSectionErr.name;
            await req.post(`/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections`)
                .set('Content-Type', 'application/json')
                .expect(400);
            await req.post(`/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections`)
                .set('Content-Type', 'application/json')
                .send({ menuSection: menuSectionErr })
                .expect(400);
            await req.post(`/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections`)
                .set('Content-Type', 'application/json')
                .send({ menuSection })
                .expect(200);
            await req.post(`/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections`)
                .set('Content-Type', 'application/json')
                .send({ menuSection })
                .expect(400);
            await processEvents();

            await req.get(`/restaurant-catalog-service/restaurants/${rest.restId}/menu`)
                .expect(res => {
                    const menu = res.body;
                    const actual = menu.filter(s => s.name === menuSection.name)[0];
                    const expected = JSON.parse(JSON.stringify(menuSection));
                    assert.deepStrictEqual(actual, expected);
                })
                .expect(200);
        });

        it(`POST\t/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections/${menuSection.name}/dishes`, async function () {
            
            menuSection.addDish(dish);
            const dishErr = Object.assign({}, dish);
            delete dishErr.name;
            await req.post(`/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections/NotExistentSection/dishes`)
                .set('Content-Type', 'application/json')
                .send({ dish })
                .expect(404);
            await req.post(`/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections/${menuSection.name}/dishes`)
                .set('Content-Type', 'application/json')
                .send({ dish: dishErr })
                .expect(400);
            await req.post(`/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections/${menuSection.name}/dishes`)
                .set('Content-Type', 'application/json')
                .send({ dish })
                .expect(200);
            await processEvents();

            await req.get(`/restaurant-catalog-service/restaurants/${rest.restId}/menu`)
                .expect(res => {
                    const menu = res.body;
                    const actual = menu.filter(s => s.name === menuSection.name)[0];
                    const expected = JSON.parse(JSON.stringify(menuSection));
                    assert.deepStrictEqual(actual, expected);
                })
                .expect(200);
        });

        it(`PUT\t/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections/${menuSection.name}/dishes/${dish.name}`, async function () {
            
            menuSection.removeDish(dish);
            menuSection.addDish(dish_v2);
            const dishErr = Object.assign({}, dish_v2);
            delete dishErr.name;
            await req.put(`/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections/NotExistentSection/dishes/${dish.name}`)
                .set('Content-Type', 'application/json')
                .send({ dish: dish_v2 })
                .expect(404);
            await req.put(`/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections/${menuSection.name}/dishes/${dish.name}`)
                .set('Content-Type', 'application/json')
                .send({ dish: dishErr })
                .expect(400);
            await req.put(`/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections/${menuSection.name}/dishes/${dish.name}`)
                .set('Content-Type', 'application/json')
                .send({ dish: dish_v2 })
                .expect(200);
            await processEvents();

            await req.get(`/restaurant-catalog-service/restaurants/${rest.restId}/menu`)
                .expect(res => {
                    const menu = res.body;
                    const actual = menu.filter(s => s.name === menuSection.name)[0];
                    const expected = JSON.parse(JSON.stringify(menuSection));
                    assert.deepStrictEqual(actual, expected);
                })
                .expect(200);
        });

        it(`DELETE\t/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections/${menuSection.name}/dishes/${dish_v2.name}`, async function () {
            
            menuSection.removeDish(dish_v2);
            await req.delete(`/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections/NotExistentSection/dishes/${dish_v2.name}`)
                .set('Content-Type', 'application/json')
                .expect(404);
            await req.delete(`/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections/${menuSection.name}/dishes/NotExistentDish`)
                .set('Content-Type', 'application/json')
                .expect(404);
            await req.delete(`/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections/${menuSection.name}/dishes/${dish_v2.name}`)
                .set('Content-Type', 'application/json')
                .expect(200);
            await processEvents();

            await req.get(`/restaurant-catalog-service/restaurants/${rest.restId}/menu`)
                .expect(res => {
                    const menu = res.body;
                    const actual = menu.filter(s => s.name === menuSection.name)[0];
                    const expected = JSON.parse(JSON.stringify(menuSection));
                    assert.deepStrictEqual(actual, expected);
                })
                .expect(200);
        });

        it(`DELETE\t/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections/${menuSection.name}`, async function () {
            
            const menuSectionErr = Object.assign({}, menuSection);
            delete menuSectionErr.name;
            await req.delete(`/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections/aaaaaaaaaaaaa`)
                .set('Content-Type', 'application/json')
                .expect(404);
            await req.delete(`/restaurant-catalog-service/restaurants/${rest.restId}/menu/menuSections/${menuSection.name}`)
                .set('Content-Type', 'application/json')
                .expect(200);
            await processEvents();

            await req.get(`/restaurant-catalog-service/restaurants/${rest.restId}/menu`)
                .expect(res => {
                    const menu = res.body;
                    const actual = menu.filter(s => s.name === menuSection.name)[0];
                    assert.deepStrictEqual(actual, undefined);
                })
                .expect(200);
        });
    });
});
