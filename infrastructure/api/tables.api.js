const express = require('express');
const Table = require('../../domain/models/table');

const router = express.Router();

let restaurantMgr = null;
let queryManager = null;

function clientError(res, message, code) {
    res.status(code || 400);
    res.json({ error: message });
}


router.get('/', async (req, res) => {
    const restId = req.restId;
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

router.post('/', async (req, res) => {
    const restId = req.restId;
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

router.delete('/:tableId', async (req, res) => {
    const restId = req.restId;
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

router.put('', async (req, res) => {
    const restId = req.restId;
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
        await restaurantMgr.tablesChanged(restId, tables);
        res.redirect(301, `/restaurants/${restId}/tables`);
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

function exportFunc(restaurantManager, queryManager) {
    if (!restaurantManager || !queryManager)
        throw new Error(`Missing the following parameters:${restaurantManager ? '' : ' restaurantManager'}${queryManager ? '' : ' queryManager'}`);
    restaurantMgr = restaurantManager;
    queryMgr = queryManager;
    return router;
}

module.exports = exportFunc;