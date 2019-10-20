const assert = require('assert');
const uuid = require('uuid/v4');
const request = require('supertest');
const MongoClient = require('mongodb').MongoClient;
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

const repo = require('../../infrastructure/repository/repositoryManager')('testdb');
const businessManager = require('../../domain/logic/restaurantManager')(repo);
const queryManagerFunc = require('../../infrastructure/query');
const appFunc = require('../../infrastructure/api/api');
const assertStrictEqual = require('../../lib/utils').assertStrictEqual;

const Table = require('../../domain/models/table');
const Restaurant = require('../../domain/models/restaurant');
const lib = require('./lib/restaurant-test.lib');


const mongod = new MongoMemoryServer();
let app;
let queryMgr;
let req;


async function setUpMongo() {
    const connString = await mongod.getConnectionString();
    mongodb = new MongoClient(connString, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongodb.connect();
    collection = mongodb.db('Reservation').collection('Reservation');
}
async function setUpQuery() {
    const connString = await mongod.getConnectionString();
    queryMgr = await queryManagerFunc(connString, 'Reservation', 'Reservation');
}

describe('Integration test', function () {

    before(async () => {
        repo.reset();
        await setUpMongo();
        await setUpQuery();
        app = appFunc(businessManager, queryMgr);
        req = request(app);
    })
    
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
        
        it('post /restaurant-catalog-service/restaurant/create', async function () {
            await req.post('/restaurant-catalog-service/restaurant/create')
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
        });
        
        it(`get /restaurant-catalog-service/restaurant?restId=${rest.restId}`, async function () {
            await req.get(`/restaurant-catalog-service/restaurant?restId=${rest.restId}`)
                .expect(res => {
                    const result = res.body;
                    // result.restId = parseInt(result.restId, 10);
                    const expected = JSON.parse(JSON.stringify(rest));
                    // assert.deepStrictEqual(result, expected);
                    assertStrictEqual(result, expected);
                })
                .expect(200);
        });
        it('post /restaurant-catalog-service/restaurant/remove', async function () {
            await req.post('/restaurant-catalog-service/restaurant/remove')
                .set('Content-Type', 'application/json')
                .send({ restId: rest.restId })
                .expect({ message: 'success' })
                .expect(200);
        });
        
        it(`get /restaurant-catalog-service/restaurant?restId=${rest.restId}`, async function () {
            await req.get(`/restaurant-catalog-service/restaurant?restId=${rest.restId}`)
                .expect(404);
        });
    });
    
    context('Add and remove tables from restaurant', function () {
        const name = 'I quattro cantoni';
        const owner = 'Giacomo';
        const rest = new Restaurant(uuid(), name, owner, lib.defaultTimetable, lib.defaultMenu, lib.defaultPhone);
        
        it('post /restaurant-catalog-service/restaurant/create', async function () {
            await req.post('/restaurant-catalog-service/restaurant/create')
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
        });
        
        it(`get /restaurant-catalog-service/restaurant/tables?restId=${rest.restId}`, async function () {
            await req.get(`/restaurant-catalog-service/restaurant/tables?restId=${rest.restId}`)
                .expect(res => {
                    const result = res.body;
                    assert.strictEqual(Array.isArray(result), true);
                    assert.strictEqual(result.length, 0);
                })
                .expect(200);
        });
        
        it('post /restaurant-catalog-service/restaurant/addTable', async function () {
            const table = new Table(1, rest.restId, 4);
            const table2 = new Table(2, rest.restId, 4);
            await req.post('/restaurant-catalog-service/restaurant/addTable')
                .set('Content-Type', 'application/json')
                .send({ restId: table.restaurantId })
                .send({ table: JSON.stringify(table) })
                .expect({})
                .expect(301);
            await req.get('/restaurant-catalog-service/restaurant/tables?restId=' + rest.restId)
                .expect(res => {
                    const result = res.body;
                    assert.strictEqual(Array.isArray(result), true);
                    assert.strictEqual(result.length, 1);
                    assert.strictEqual(JSON.stringify(result), JSON.stringify([table]));
                })
                .expect(200);
            await req.post('/restaurant-catalog-service/restaurant/addTable')
                .set('Content-Type', 'application/json')
                .send({ restId: table2.restaurantId })
                .send({ table: JSON.stringify(table2) })
                .expect({})
                .expect(301);
        });
        
        it('post /restaurant-catalog-service/restaurant/removeTable', async function () {
            const table = new Table(1, rest.restId, 4);
            const table2 = new Table(2, rest.restId, 4);
            await req.post('/restaurant-catalog-service/restaurant/removeTable')
                .set('Content-Type', 'application/json')
                .send({ restId: table.restaurantId })
                .send({ table: JSON.stringify(table) })
                .expect({})
                .expect(301);
            await req.post('/restaurant-catalog-service/restaurant/removeTable')
                .set('Content-Type', 'application/json')
                .send({ restId: table.restaurantId })
                .send({ table: table2.id })
                .expect({})
                .expect(301);
            await req.get('/restaurant-catalog-service/restaurant/tables?restId=' + rest.restId)
                .expect(res => {
                    const result = res.body;
                    assert.strictEqual(Array.isArray(result), true);
                    assert.strictEqual(result.length, 0);
                    assert.strictEqual(JSON.stringify(result), JSON.stringify([]));
                })
                .expect(200);
        });
        
        it('post /restaurant-catalog-service/restaurant/addTables', async function () {
            const table = new Table(3, rest.restId, 4);
            const table2 = new Table(4, rest.restId, 4);
            await req.post('/restaurant-catalog-service/restaurant/addTables')
                .set('Content-Type', 'application/json')
                .send({ restId: table.restaurantId })
                .send({ tables: JSON.stringify([table, table2]) })
                .expect({})
                .expect(301);
            await req.get('/restaurant-catalog-service/restaurant/tables?restId=' + rest.restId)
                .expect(res => {
                    const result = res.body;
                    assert.strictEqual(Array.isArray(result), true);
                    assert.strictEqual(result.length, 2);
                    assert.strictEqual(JSON.stringify(result), JSON.stringify([table, table2]));
                })
                .expect(200);
        });
        
        it('post /restaurant-catalog-service/restaurant/removeTables', async function () {
            const table = new Table(3, rest.restId, 4);
            const table2 = new Table(4, rest.restId, 4);
            await req.post('/restaurant-catalog-service/restaurant/removeTables')
                .set('Content-Type', 'application/json')
                .send({ restId: table.restaurantId })
                .send({ tables: JSON.stringify([table]) })
                .expect({})
                .expect(301);
            await req.post('/restaurant-catalog-service/restaurant/removeTables')
                .set('Content-Type', 'application/json')
                .send({ restId: table.restaurantId })
                .send({ tables: JSON.stringify([table2.id]) })
                .expect({})
                .expect(301);
            await req.get(`/restaurant-catalog-service/restaurant/tables?restId=${rest.restId}`)
                .expect(res => {
                    const result = res.body;
                    assert.strictEqual(Array.isArray(result), true);
                    assert.strictEqual(result.length, 0);
                    assert.strictEqual(JSON.stringify(result), JSON.stringify([]));
                })
                .expect(200);
        });
    });
});
