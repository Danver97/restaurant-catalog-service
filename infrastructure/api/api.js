const express = require('express');
const bodyParser = require('body-parser');
/*const repositoryManager = require('../infrastructure/repository/repositoryManager')();
const restaurantManager = require('../domain/logic/restaurantManager')(repositoryManager);*/
const tablesRouteFunc = require('./tables.api');
const timetablesRouteFunc = require('./timetables.api');
const menuRouteFunc = require('./menu.api');
const Table = require('../../domain/models/table');
const Location = require('../../domain/models/location');
const timetableLib = require('../../domain/models/timetable');
const Timetable = timetableLib.Timetable;
const DayTimetable = timetableLib.DayTimetable;
const Menu = require('../../domain/models/menu').Menu;
const Phone = require('../../domain/models/phone');
const QueryError = require('../../infrastructure/query/query_error');

const app = express();
let restaurantMgr = null;
let queryMgr = null;
let maps = null;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.param('restId', function (req, res, next, restId) {
    req.restId = restId;
    next();
});

function emptyResponse(res, code) {
    res.status(code || 200);
    res.end();
}
function clientError(res, message, code) {
    res.status(code || 400);
    res.json({ error: message });
}
function serverError(res, message, code) {
    res.status(code || 500);
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

app.get('/restaurant-catalog-service/restaurants', async (req, res) => {
    if (!req.query.coordinates && !req.query.address) {
        clientError(res, `Missing query paramters: required either 'coordinates' or 'address'`);
        return;
    }

    let offset = req.query.offset || 0;
    let radius = req.query.radius;
    let coordinates = req.query.coordinates;
    let address = req.query.address;
    if (coordinates) {
        coordinates = JSON.parse(coordinates);
        try {
            Location.checkCoordinatesValidity(coordinates);
        } catch (e) {
            clientError(res, e.msg);
            return;
        }
    } else if (address) {
        // coordinates = await maps.geocode({ address }).asPromise();
        serverError(res, 'Service do not support geocode functionality yet. Please stick with raw coordinates support.');
        return;
    }
    if (typeof offset !== 'number') {
        clientError(res, `Paramter type error: 'offset' must be an integer below 20000.`);
        return;
    }

    try {
        let result;
        let startingRadius = radius || 500;
        do {
            result = await queryMgr.nearme({
                distance: startingRadius,
                coordinates,
                offset,
            });
            startingRadius *= 2;
        } while (result.hits < 200 && startingRadius < 50000);
        res.json({
            restaurants: result.docs,
            hits: result.hits,
            radius: result.distance,
        });
    } catch (e) {
        res.status(e.code || 500);
        res.json({ error: e });
    }
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
        res.json({ message: 'Missing restId parameter.' });
        return;
    }
    try {
        const rest = await queryMgr.getRestaurant(params.restId);
        //rest.timetable = rest.timetable.toJSON();
        res.json(rest);
    } catch (e) {
        if (e instanceof QueryError) {
            switch (e.code) {
                case QueryError.paramError:
                    clientError(res, 'Missing some paramters', 400);
                    return;
                case QueryError.notFound:
                    clientError(res, 'Restaurant not found', 404);
                    return;
            }
        }
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

app.post('/restaurant-catalog-service/restaurants/:restId/location', async (req, res) => {
    const params = req.params;
    const body = req.body;
    if (!params.restId) {
        clientError(res, 'Missing restId url parameter.');
        return;
    }
    if (!body.coordinates && !body.address) {
        clientError(res, `Missing some fields from the request body: required either 'coordinates' or 'address'`);
        return;
    }
    if (body.coordinates && body.address) {
        clientError(res, `Request body conflict: specify one between 'coordinates' or 'address'`);
        return;
    }
    if (body.coordinates && (!body.coordinates.lat || !body.coordinates.lon)) {
        clientError(res, `Request body conflict: specify 'lat' and 'lon' for 'coordinates'`);
        return;
    }
    if (!body.address && body.coordinates) {
        try {
            Location.checkCoordinatesValidity(body.coordinates);
        } catch (error) {
            clientError(res, error.msg);
            return;
        }
    }
    
    const restId = params.restId;
    let address = body.address;
    let coordinates = body.coordinates;
    try {
        // Try to convert coordinates into address and viceversa using Maps API.
        // Currently not supported, but code is already there. It has only to be uncommented.
        if (!address)
            address = 'mockAddress'; // await maps.reverseGeocode({ latlng: [coordinates.lat, coordinates.lon] }).asPromise();
        else if (!coordinates)
            throw new Error('Geocoding not supported yet'); // coordinates = await maps.geocode({ address }).asPromise();
    } catch (e) {
        serverError(res, `Address translation into coordinates currently not supported. Please provide coordinates.`);
        // serverError(res, `Cannot translate ${body.address ? 'address' : 'coordinates'} into ${!body.address ? 'address' : 'coordinates'}`);
        return;
    }

    try {
        const location = new Location(coordinates, address);
        await restaurantMgr.locationChanged(restId, location);
        emptyResponse(res);
    } catch (e) {
        console.log(e);
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


function exportFunc(restaurantManager, queryManager /* , mapsAPIClient */) {
    /* if (!restaurantManager || !queryManager || !mapsAPIClient)
        throw new Error(`Missing the following parameters:${restaurantManager ? '' : ' restaurantManager'}${queryManager ? '' : ' queryManager'}${mapsAPIClient ? '' : ' mapsAPIClient'}`); */
    if (!restaurantManager || !queryManager)
        throw new Error(`Missing the following parameters:${restaurantManager ? '' : ' restaurantManager'}${queryManager ? '' : ' queryManager'}`);
    restaurantMgr = restaurantManager;
    queryMgr = queryManager;
    /* maps = mapsAPIClient; */

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
