const Promisify = require('promisify-cb');
const Restaurant = require('../../domain/models/restaurant');
const QueryError = require('./query_error');

let mongoCollection = null;

function nearme(cb) {
    return Promisify(async () => {
        const docs = await mongoCollection.find({}).toArray();
        if (!docs)
            throw new QueryError('Documents not found', QueryError.notFound);
        return docs.map(d => Restaurant.fromObject(d));
    }, cb);
}

function exportFunc(mongodbCollection) {
    if (!mongodbCollection)
        throw new QueryError(`Missing the following parameters:${mongodbCollection ? '' : ' mongodbCollection'}`, QueryError.paramError);
    mongoCollection = mongodbCollection;
    return {
        nearme
    };
}

module.exports = exportFunc;