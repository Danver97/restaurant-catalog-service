const ENV = require('./src/env');
const repo = require('./infrastructure/repository/repositoryManager')(ENV.event_store);
const businessManager = require('./domain/logic/restaurantManager')(repo);
// const eventHandlerManager = require('./infrastructure/messaging/eventHandler')(businessManager, ENV.event_broker, {});
const queryManagerFunc = require('./infrastructure/query');
const appFunc = require('./infrastructure/api/api');
const googleMapsClient = require('@google/maps').createClient({
    key: ENV.maps_api_key
});

let queryManager;
let app;

async function init() {

    queryManager = await queryManagerFunc(ENV.mongodb_url, ENV.mongodb_dbName, ENV.mongodb_collection);
    app = appFunc(businessManager, queryManager, googleMapsClient);
    app.listen(ENV.port, () => {
        console.log(`Server started on port ${ENV.port}`);
    });
}

init();

