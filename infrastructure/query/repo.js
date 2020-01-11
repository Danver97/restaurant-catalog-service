const Promisify = require('promisify-cb');
const Restaurant = require('../../domain/models/restaurant');
const Location = require('../../domain/models/location');
const QueryError = require('./query_error');

let mongoCollection = null;
let es = null;

function nearme(options = {}, cb) {
    let distance = options.distance;
    let coordinates = options.coordinates;
    if (!distance || !coordinates)
        throw new QueryError(`Missing the following parameter:${distance ? '' : 'options.distance'}${coordinates ? '' : 'options.coordinates'}`, QueryError.paramError);
    
    if (coordinates)
        try { Location.checkCoordinatesValidity(coordinates); } catch (e) { throw new QueryError(e.msg, QueryError.paramError); }
    return Promisify(async () => {
        let res = await es.client.search({
            index: es.index,
            body: { query: {
                geo_distance: {
                    distance,
                    'location.coordinates': coordinates,
                }
            } }
        });
        docs = res.body.hits.hits.map(d => d._source);
        return docs.map(d => Restaurant.fromObject(d));
    }, cb);
}

function getRestaurant(restId, cb) {
    if (!restId)
        throw new QueryError('Missing the following parameter: restId', QueryError.paramError);
    return Promisify(async () => {
        const doc = await mongoCollection.findOne({ _id: restId });
        if (!doc)
            throw new QueryError('Restaurant not found', QueryError.notFound);
        return Restaurant.fromObject(doc);
    }, cb);
}

function exportFunc(mongodbCollection, esOptions = {}) {
    if (!mongodbCollection || !esOptions.client || !esOptions.index)
        throw new QueryError(`Missing the following parameters:
        ${mongodbCollection ? '' : ' mongodbCollection'}${esOptions.client ? '' : ' esOptions.client'}${esOptions.index ? '' : ' esOptions.index'}`, QueryError.paramError);
    mongoCollection = mongodbCollection;
    es = esOptions;
    return {
        nearme,
        getRestaurant,
    };
}

module.exports = exportFunc;
