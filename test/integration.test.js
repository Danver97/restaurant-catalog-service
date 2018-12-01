const assert = require('assert');
const uuid = require('uuid/v4');
const request = require('supertest');
const app = require('../src/app');
const assertStrictEqual = require('../lib/utils').assertStrictEqual;

const Table = require('../domain/models/table');
const Restaurant = require('../domain/models/restaurant');

const req = request(app);
// const req = request('localhost:3000');

describe('Integration test', function () {
    
    it('service test', async function () {
        await req.get('/')
            .expect(JSON.stringify({
                service: 'restaurant-catalog-service',
            }));
    });
    
    context('Create and destroy restaurant', function () {
        const name = 'I quattro cantoni';
        const owner = 'Giacomo';
        const rest = new Restaurant(uuid(), name, owner);
        
        it('post /restaurant/create', async function () {
            await req.post('/restaurant/create')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .type('form')
                .send({ id: rest.id })
                .send({ restaurantName: rest.restaurantName })
                .send({ owner: rest.owner })
                .expect({})
                .expect(301);
        });
        
        it(`get /restaurant?restId=${rest.id}`, async function () {
            await req.get(`/restaurant?restId=${rest.id}`)
                .expect(res => {
                    const result = res.body;
                    // result.id = parseInt(result.id, 10);
                    const expected = JSON.parse(JSON.stringify(rest));
                    // assert.deepStrictEqual(result, expected);
                    assertStrictEqual(result, expected);
                })
                .expect(200);
        });
        it('post /restaurant/remove', async function () {
            await req.post('/restaurant/remove')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .type('form')
                .send({ id: rest.id })
                .expect({ message: 'success' })
                .expect(200);
        });
        
        it(`get /restaurant?restId=${rest.id}`, async function () {
            await req.get(`/restaurant?restId=${rest.id}`)
                .expect(404);
        });
    });
    
    context('Add and remove tables from restaurant', function () {
        const name = 'I quattro cantoni';
        const owner = 'Giacomo';
        const rest = new Restaurant(uuid(), name, owner);
        
        it('post /restaurant/create', async function () {
            await req.post('/restaurant/create')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .type('form')
                .send({ id: rest.id })
                .send({ restaurantName: rest.restaurantName })
                .send({ owner: rest.owner })
                .expect({})
                .expect(301);
        });
        
        it(`get /restaurant/tables?restId=${rest.id}`, async function () {
            await req.get(`/restaurant/tables?restId=${rest.id}`)
                .expect(res => {
                    const result = res.body;
                    assert.strictEqual(Array.isArray(result), true);
                    assert.strictEqual(result.length, 0);
                })
                .expect(200);
        });
        
        it('post /restaurant/addTable', async function () {
            const table = new Table(1, rest.id, 4);
            const table2 = new Table(2, rest.id, 4);
            await req.post('/restaurant/addTable')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .type('form')
                .send({ restId: table.restaurantId })
                .send({ table: JSON.stringify(table) })
                .expect({})
                .expect(301);
            await req.get('/restaurant/tables?restId=' + rest.id)
                .expect(res => {
                    const result = res.body;
                    assert.strictEqual(Array.isArray(result), true);
                    assert.strictEqual(result.length, 1);
                    assert.strictEqual(JSON.stringify(result), JSON.stringify([table]));
                })
                .expect(200);
            await req.post('/restaurant/addTable')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .type('form')
                .send({ restId: table2.restaurantId })
                .send({ table: JSON.stringify(table2) })
                .expect({})
                .expect(301);
        });
        
        it('post /restaurant/removeTable', async function () {
            const table = new Table(1, rest.id, 4);
            const table2 = new Table(2, rest.id, 4);
            await req.post('/restaurant/removeTable')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .type('form')
                .send({ restId: table.restaurantId })
                .send({ table: JSON.stringify(table) })
                .expect({})
                .expect(301);
            await req.post('/restaurant/removeTable')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .type('form')
                .send({ restId: table.restaurantId })
                .send({ table: table2.id })
                .expect({})
                .expect(301);
            await req.get('/restaurant/tables?restId=' + rest.id)
                .expect(res => {
                    const result = res.body;
                    assert.strictEqual(Array.isArray(result), true);
                    assert.strictEqual(result.length, 0);
                    assert.strictEqual(JSON.stringify(result), JSON.stringify([]));
                })
                .expect(200);
        });
        
        it('post /restaurant/addTables', async function () {
            const table = new Table(3, rest.id, 4);
            const table2 = new Table(4, rest.id, 4);
            await req.post('/restaurant/addTables')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .type('form')
                .send({ restId: table.restaurantId })
                .send({ tables: JSON.stringify([table, table2]) })
                .expect({})
                .expect(301);
            await req.get('/restaurant/tables?restId=' + rest.id)
                .expect(res => {
                    const result = res.body;
                    assert.strictEqual(Array.isArray(result), true);
                    assert.strictEqual(result.length, 2);
                    assert.strictEqual(JSON.stringify(result), JSON.stringify([table, table2]));
                })
                .expect(200);
        });
        
        it('post /restaurant/removeTables', async function () {
            const table = new Table(3, rest.id, 4);
            const table2 = new Table(4, rest.id, 4);
            await req.post('/restaurant/removeTables')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .type('form')
                .send({ restId: table.restaurantId })
                .send({ tables: JSON.stringify([table]) })
                .expect({})
                .expect(301);
            await req.post('/restaurant/removeTables')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .type('form')
                .send({ restId: table.restaurantId })
                .send({ tables: JSON.stringify([table2.id]) })
                .expect({})
                .expect(301);
            await req.get(`/restaurant/tables?restId=${rest.id}`)
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
