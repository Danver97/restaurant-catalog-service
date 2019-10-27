const express = require('express');
const bodyParser = require('body-parser');
/*const repositoryManager = require('../infrastructure/repository/repositoryManager')();
const restaurantManager = require('../domain/logic/restaurantManager')(repositoryManager);*/
const tablesRouteFunc = require('./tables.api');
const timetablesRouteFunc = require('./timetables.api');
const menuRouteFunc = require('./menu.api');
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
app.param('restId', function (req, res, next, restId) {
    req.restId = restId;
    next();
});

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
        //rest.timetable = rest.timetable.toJSON();
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


function exportFunc(restaurantManager, queryManager) {
    if (!restaurantManager || !queryManager)
        throw new Error(`Missing the following parameters:${restaurantManager ? '' : ' restaurantManager'}${queryManager ? '' : ' queryManager'}`);
    restaurantMgr = restaurantManager;
    queryMgr = queryManager;

    // Tables API
    const tablesRoute = tablesRouteFunc(restaurantManager, queryManager);
    app.use('/restaurant-catalog-service/restaurants/:restId/tables', tablesRoute);

    // Timetables API
    const timetablesRoute = timetablesRouteFunc(restaurantManager, queryManager);
    app.use('/restaurant-catalog-service/restaurants/:restId/timetables', timetablesRoute);

    // Menu API
    const menuRoute = menuRouteFunc(restaurantManager, queryManager);
    app.use('/restaurant-catalog-service/restaurants/:restId/menu', menuRoute);
    return app;
}

module.exports = exportFunc;
