const express = require('express');
const bodyParser = require('body-parser');
/*const repositoryManager = require('../infrastructure/repository/repositoryManager')();
const restaurantManager = require('../domain/logic/restaurantManager')(repositoryManager);*/
const Table = require('../../domain/models/table');
const timetableLib = require('../../domain/models/timetable');
const Timetable = timetableLib.Timetable;
const DayTimetable = timetableLib.DayTimetable;
const Menu = require('../../domain/models/menu').Menu;
const Phone = require('../../domain/models/phone');

const app = express();
let restaurantMgr = null;
let queryMgr = null;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

function clientError(res, message, code) {
    res.status(code || 400);
    res.json({ error: message });
}

app.get('/restaurant-catalog-service', (req, res) => {
    res.json({
        service: 'restaurant-catalog-service',
    });
});

app.get('/restaurant-catalog-service/nearme', async (req, res) => {
    const docs = await queryMgr.nearme();
    res.json(docs);
});

app.get('/restaurant-catalog-service/restaurants', (req, res) => {
    res.json({ response: 'get nearby restaurants' });
});

app.post('/restaurant-catalog-service/restaurants', async (req, res) => {
    const body = req.body;
    if (!body.restaurantName || !body.owner) { // TODO: more body params to check
        res.status(400);
        res.json({ error: 'Missing some required parameters (name or owner).' });
        return;
    }
    try {
        body.menu = Menu.fromObject(body.menu);
        body.telephone = new Phone(body.telephone);
        const timetable = new Timetable();
        body.timetable.forEach(dt => {
            timetable.setDay(DayTimetable.fromObject(dt));
        });
        body.timetable = timetable;
        const rest = await restaurantMgr.restaurantCreated(req.body);
        res.status(200);
        res.json({ restId: rest.restId });
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

app.get('/restaurant-catalog-service/restaurants/:restId', async (req, res) => {
    const params = req.params;
    if (!params.restId) {
        res.status(400);
        res.json({ message: 'Missing query restId parameter.' });
        return;
    }
    try {
        const rest = await restaurantMgr.getRestaurant(params.restId);
        // console.log(rest);
        res.json(rest);
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

app.post('/restaurant-catalog-service/restaurant/remove', async (req, res) => {
    if (!req.body.restId) {
        res.status(400);
        res.json({ error: 'Missing some required parameters (restId).' });
        return;
    }
    try {
        await restaurantMgr.restaurantRemoved(req.body.restId);
        res.status(200);
        res.json({ message: 'success' });
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

app.get('/restaurant-catalog-service/restaurants/:restId/tables', async (req, res) => {
    const restId = req.params.restId;
    if (!restId) {
        res.status(400);
        res.json({ error: 'Missing query restId parameter.' });
        return;
    }
    try {
        const tables = await restaurantMgr.getTables(restId);
        res.json(tables);
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

app.post('/restaurant-catalog-service/restaurants/:restId/tables', async (req, res) => {
    const restId = req.params.restId;
    let table = req.body;
    if (!restId || !table) {
        res.status(400);
        res.json({ error: 'Missing some required parameters (restId or table).' });
        return;
    }
    try {
        table = new Table(table.id, table.people);
    } catch (e) {
        res.status(400);
        res.json({ error: 'Wrong table properties' });
        return;
    }
    try {
        await restaurantMgr.tableAdded(restId, table);
        res.redirect(301, `/restaurants/${restId}/tables`);
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

app.delete('/restaurant-catalog-service/restaurants/:restId/tables/:tableId', async (req, res) => {
    const restId = req.params.restId;
    const tableId = req.params.tableId;
    if (!restId || !tableId) {
        res.status(400);
        res.json({ error: 'Missing some required parameters (restId or table).' });
        return;
    }
    if (typeof tableId !== 'string') {
        res.status(400);
        res.json({ error: 'Wrong parameter: tableId must be a string' });
        return;
    }
    try {
        await restaurantMgr.tableRemoved(restId, tableId);
        res.redirect(301, `/restaurants/${restId}/tables`);
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

app.put('/restaurant-catalog-service/restaurants/:restId/tables', async (req, res) => {
    const restId = req.params.restId;
    let tables = req.body;
    if (!restId || !tables) {
        res.status(400);
        res.json({ error: 'Missing some required parameters (restId or tables).' });
        return;
    }
    try {
        // NO: body.tables = JSON.parse(body.tables);
        // console.log('body.tables');
        // console.log(body.tables);
        if (!Array.isArray(tables))
            throw new Error('Is not array');
        if (tables.length > 0 && typeof tables[0] !== 'object')
            throw new Error('Is not array of number or objects');
        tables = tables.map(t => new Table(t.id, t.people));
    } catch (e) {
        res.status(400);
        res.json({ error: 'Wrong body: must be an array of objects.' });
        return;
    }
    try {
        await restaurantMgr.tablesAdded(restId, tables);
        res.redirect(301, `/restaurants/${restId}/tables`);
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});
/*
app.post('/restaurant-catalog-service/restaurant/removeTables', async (req, res) => {
    const body = req.body;
    if (!req.body.restId || !req.body.tables) {
        res.status(400);
        res.json({ error: 'Missing some required parameters (restId or tables).' });
        return;
    }
    try {
        body.tables = JSON.parse(req.body.tables);
        if (!Array.isArray(body.tables))
            throw new Error('Is not array');
        if (body.tables.length > 0 && typeof body.tables[0] !== 'object' && typeof body.tables[0] !== 'number')
            throw new Error('Is not array of number or objects');
        if (body.tables.length > 0 && typeof body.tables[0] === 'object')
            body.tables = body.tables.map(t => new Table(t.id, t.restaurantId, t.people));
    } catch (e) {
        res.status(400);
        res.json({ error: 'Wrong parameter: table should be a JSON array of objects.' });
        return;
    }
    try {
        await restaurantMgr.tablesRemoved(body.restId, body.tables);
        res.redirect(301, `/restaurant/tables?restId=${body.restId}`);
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});
*/
// TODO:
// - check if <table> param of post add/removeTable is number.
// - get restaurants based on position


function exportFunc(restaurantManager, queryManager) {
    if (!restaurantManager || !queryManager)
        throw new Error(`Missing the following parameters:${restaurantManager ? '' : ' restaurantManager'}${queryManager ? '' : ' queryManager'}`);
    restaurantMgr = restaurantManager;
    queryMgr = queryManager;
    return app;
}

module.exports = exportFunc;
