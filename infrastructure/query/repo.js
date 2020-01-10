const Promisify = require('promisify-cb');
const Restaurant = require('../../domain/models/restaurant');
const Location = require('../../domain/models/location');
const QueryError = require('./query_error');

let mongoCollection = null;
let es = null;
let maps = null;

function nearme(options = {}, cb) {
    if (!options.distance)
        throw new QueryError(`Missing the following parameter: 'options.distance'`, QueryError.paramError);
    if (!options.address && !options.coordinates)
        throw new QueryError(`At least one of the following parameters are required: 'options.address', 'options.coordinates'`, QueryError.paramError);
    
    if (options.coordinates)
        try { Location.checkCoordinatesValidity(options.coordinates); } catch (e) { throw new QueryError(e.msg, QueryError.paramError); }
    return Promisify(async () => {
        let coordinates = options.coordinates;
        if (!coordinates)
            throw new QueryError('Maps API not supported yet. Please specify option.coordinates');
            // coordinates = await maps.geocode({ address }).asPromise();
        let res = await es.client.search({
            index: es.index,
            body: { query: {
                geo_distance: {
                    distance: options.distance,
                    'location.coordinates': {
                        lat: coordinates.lat,
                        lon: coordinates.lon
                    }
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

function exportFunc(mongodbCollection, esOptions = {}, mapsAPIClient) {
    if (!mongodbCollection || !esOptions.client || !esOptions.index)
        throw new QueryError(`Missing the following parameters:
        ${mongodbCollection ? '' : ' mongodbCollection'}${esOptions.client ? '' : ' esOptions.client'}${esOptions.index ? '' : ' esOptions.index'}`, QueryError.paramError);
    mongoCollection = mongodbCollection;
    es = esOptions;
    maps = mapsAPIClient;
    return {
        nearme,
        getRestaurant,
    };
}

module.exports = exportFunc;
