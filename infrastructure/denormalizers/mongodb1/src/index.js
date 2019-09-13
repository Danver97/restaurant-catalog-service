const eventBroker = require('@danver97/event-sourcing/eventBroker')('testbroker');
const mongodbFunc = require('../projection/mongodb');
const handlerFunc = require('../handler');

async function init() {
    const projection = await mongodbFunc('url', 'dbName');
    const handler = handlerFunc(eventBroker, projection);
    eventBroker.startPoll(handler);
}

module.exports = init;

// eventHandler dev'essere una funzione del tipo fz(e) {} che va a chiamare a seconda del messaggio dell'evento
// l'handler più adeguato, un po' come accade nel meccanismo di comunicazione asincrona.
