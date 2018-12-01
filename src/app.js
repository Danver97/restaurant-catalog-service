const express = require('express');
const bodyParser = require('body-parser');
const repositoryManager = require('../infrastructure/repository/repositoryManager')();
const restaurantManager = require('../domain/logic/restaurantManager')(repositoryManager);
const Table = require('../domain/models/table');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.json({
        service: 'restaurant-catalog-service',
    });
});

app.get('/restaurants', (req, res) => {
    res.json({ response: 'get nearby restaurants' });
});

app.get('/restaurant', async (req, res) => {
    const query = req.query;
    if (!query.restId) {
        res.status(400);
        res.json({ message: 'Missing query restId parameter.' });
        return;
    }
    try {
        const rest = await restaurantManager.getRestaurant(query.restId);
        // console.log(rest);
        res.json(rest);
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

app.get('/restaurant/tables', async (req, res) => {
    const query = req.query;
    if (!query.restId) {
        res.status(400);
        res.json({ error: 'Missing query restId parameter.' });
        return;
    }
    try {
        const tables = await restaurantManager.getTables(req.query.restId);
        res.json(tables);
    } catch (e) {
        console.log(e);
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

app.post('/restaurant/create', async (req, res) => {
    if (!req.body.restaurantName || !req.body.owner) {
        res.status(400);
        res.json({ error: 'Missing some required parameters (name or owner).' });
        return;
    }
    try {
        await restaurantManager.restaurantCreated(req.body);
        res.redirect(301, `/restaurant/${req.body.restId}`);
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

app.post('/restaurant/remove', async (req, res) => {
    if (!req.body.id) {
        res.status(400);
        res.json({ error: 'Missing some required parameters (id).' });
        return;
    }
    try {
        await restaurantManager.restaurantRemoved(req.body.id);
        res.status(200);
        res.json({ message: 'success' });
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

app.post('/restaurant/addTable', async (req, res) => {
    const body = req.body;
    if (!req.body.restId || !req.body.table) {
        res.status(400);
        res.json({ error: 'Missing some required parameters (restId or table).' });
        return;
    }
    try {
        const table = JSON.parse(body.table);
        body.table = new Table(table.id, table.restaurantId, table.people);
    } catch (e) {
        res.status(400);
        res.json({ error: 'Wrong parameter: table should be a JSON object.' });
        return;
    }
    try {
        await restaurantManager.tableAdded(body.restId, body.table);
        res.redirect(301, `/restaurant/tables?restId=${body.restId}`);
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

app.post('/restaurant/removeTable', async (req, res) => {
    const body = req.body;
    if (!req.body.restId || !req.body.table) {
        res.status(400);
        res.json({ error: 'Missing some required parameters (restId or table).' });
        return;
    }
    if (typeof body.table === 'string') {
        const parsed = parseInt(body.table, 10);
        if (!isNaN(parsed))
            body.table = parsed;
        else {
            try {
                const table = JSON.parse(body.table);
                body.table = new Table(table.id, table.restaurantId, table.people);
            } catch (e) {
                res.status(400);
                res.json({ error: 'Wrong parameter: table should be a JSON object or a number.' });
                return;
            }
        }
    }
    try {
        await restaurantManager.tableRemoved(body.restId, body.table);
        res.redirect(301, `/restaurant/tables?restId=${body.restId}`);
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

app.post('/restaurant/addTables', async (req, res) => {
    const body = req.body;
    if (!body.restId || !body.tables) {
        res.status(400);
        res.json({ error: 'Missing some required parameters (restId or tables).' });
        return;
    }
    try {
        body.tables = JSON.parse(body.tables);
        // console.log('body.tables');
        // console.log(body.tables);
        if (!Array.isArray(body.tables))
            throw new Error('Is not array');
        if (body.tables.length > 0 && typeof body.tables[0] !== 'object')
            throw new Error('Is not array of number or objects');
        body.tables = body.tables.map(t => new Table(t.id, t.restaurantId, t.people));
    } catch (e) {
        res.status(400);
        res.json({ error: 'Wrong parameter: table should be a JSON array of objects.' });
        return;
    }
    try {
        await restaurantManager.tablesAdded(req.body.restId, req.body.tables);
        res.redirect(301, `/restaurant/tables?restId=${body.restId}`);
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

app.post('/restaurant/removeTables', async (req, res) => {
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
        await restaurantManager.tablesRemoved(body.restId, body.tables);
        res.redirect(301, `/restaurant/tables?restId=${body.restId}`);
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

// TODO:
// - check if <table> param of post add/removeTable is number.
// - get restaurants based on position

module.exports = app;
