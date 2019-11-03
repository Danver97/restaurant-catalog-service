const express = require('express');
const menuLib = require('../../domain/models/menu');
const MenuError = require('../../domain/errors/menu.error');
const QueryError = require('../query/query_error');

const router = express.Router();

const Menu = menuLib.Menu;
const MenuSection = menuLib.MenuSection;
const Dish = menuLib.Dish;
const Price = menuLib.Price;

let restaurantMgr = null;
let queryMgr = null;

function emptyResponse(res, code) {
    res.status(code || 200);
    res.end();
}

function clientError(res, message, code) {
    res.status(code || 400);
    res.json({ error: message });
}

router.get('/', async (req, res) => {
    const restId = req.restId;
    if (!restId) {
        clientError(res, 'Missing restId parameter');
        return;
    }
    try {
        const rest = await queryMgr.getRestaurant(restId);
        res.json(rest.menu);
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

router.post('/menuSections', async (req, res) => {
    const restId = req.restId;
    const body = req.body;
    if (!restId) {
        clientError(res, 'Missing restId parameter');
        return;
    }
    if (!body.menuSection) {
        clientError(res, 'Missing menuSection body parameter');
        return;
    }
    let menuSection;
    try {
        menuSection = MenuSection.fromObject(body.menuSection);
    } catch (e) {
        clientError(res, 'menuSection is missing some properties');
        return;
    }
    try {
        await restaurantMgr.menuSectionAdded(restId, menuSection);
        emptyResponse(res);
    } catch (e) {
        if (e instanceof MenuError) {
            switch(e.code) {
                case MenuError.sectionAlreadyPresentCode:
                    clientError(res, e.msg);
                    return;
            }
        }
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

router.delete('/menuSections/:sectionName', async (req, res) => {
    const restId = req.restId;
    const sectionName = req.params.sectionName;
    if (!restId) {
        clientError(res, 'Missing restId parameter');
        return;
    }
    if (!sectionName) {
        clientError(res, 'Missing sectionName parameter');
        return;
    }
    try {
        await restaurantMgr.menuSectionRemoved(restId, sectionName);
        emptyResponse(res);
    } catch (e) {
        if (e instanceof MenuError) {
            switch(e.code) {
                case MenuError.sectionNotFoundCode:
                    clientError(res, e.msg, 404);
                    return;
            }
        }
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

router.post('/menuSections/:sectionName/dishes', async (req, res) => {
    const restId = req.restId;
    const sectionName = req.params.sectionName;
    const body = req.body;
    if (!restId) {
        clientError(res, 'Missing restId parameter');
        return;
    }
    if (!sectionName) {
        clientError(res, 'Missing sectionName parameter');
        return;
    }
    let dish;
    try {
        dish = Dish.fromObject(req.body.dish);
    } catch (e) {
        clientError(res, 'dish body parameter is missing some properties');
        return;
    }
    try {
        await restaurantMgr.dishAdded(restId, sectionName, dish);
        emptyResponse(res);
    } catch (e) {
        if (e instanceof MenuError) {
            switch(e.code) {
                case MenuError.sectionNotFoundCode:
                    clientError(res, e.msg, 404);
                    return;
                case MenuError.dishAlreadyPresentCode:
                    clientError(res, e.msg, 400);
                    return;
            }
        }
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

router.put('/menuSections/:sectionName/dishes/:dishName', async (req, res) => {
    const restId = req.restId;
    const sectionName = req.params.sectionName;
    const dishName = req.params.dishName;
    if (!restId) {
        clientError(res, 'Missing restId parameter');
        return;
    }
    if (!sectionName) {
        clientError(res, 'Missing sectionName parameter');
        return;
    }
    if (!dishName) {
        clientError(res, 'Missing dishName parameter');
        return;
    }
    let dish;
    try {
        dish = Dish.fromObject(req.body.dish);
    } catch (e) {
        clientError(res, 'dish body parameter is missing some properties');
        return;
    }
    try {
        await restaurantMgr.dishUpdated(restId, sectionName, dish);
        emptyResponse(res);
    } catch (e) {
        if (e instanceof MenuError) {
            switch(e.code) {
                case MenuError.sectionNotFoundCode:
                    clientError(res, e.msg, 404);
                    return;
                case MenuError.dishNotFoundCode:
                    clientError(res, e.msg, 404);
                    return;
            }
        }
        res.status(e.code || 500);
        res.json({ error: e });
    }
});

router.delete('/menuSections/:sectionName/dishes/:dishName', async (req, res) => {
    const restId = req.restId;
    const sectionName = req.params.sectionName;
    const dishName = req.params.dishName;
    if (!restId) {
        clientError(res, 'Missing restId parameter');
        return;
    }
    if (!sectionName) {
        clientError(res, 'Missing sectionName parameter');
        return;
    }
    if (!dishName) {
        clientError(res, 'Missing dishName parameter');
        return;
    }
    try {
        await restaurantMgr.dishRemoved(restId, sectionName, dishName);
        emptyResponse(res);
    } catch (e) {
        if (e instanceof MenuError) {
            switch(e.code) {
                case MenuError.sectionNotFoundCode:
                    clientError(res, e.msg, 404);
                    return;
                case MenuError.dishNotFoundCode:
                    clientError(res, e.msg, 404);
                    return;
            }
        }
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
