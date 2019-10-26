const express = require('express');
const timetableLib = require('../../domain/models/timetable');

const router = express.Router();
const Timetable = timetableLib.Timetable;

let restaurantMgr = null;
let queryManager = null;

function clientError(res, message, code) {
    res.status(code || 400);
    res.json({ error: message });
}

router.post('/', async (req, res) => {
    const restId = req.restId;
    let timetable = req.body.timetable;
    if (!restId || !timetable) {
        clientError(res, 'Missing some required parameters (restId or timetable).');
        return;
    }
    try {
        timetable = Timetable.fromObject(timetable);
    } catch (e) {
        clientError(res, 'Bad timetable parameter');
        return;
    }
    try {
        await restaurantMgr.timetableChanged(restId, timetable);
        res.status(200);
        res.end();
    } catch (e) {
        console.log(e);
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