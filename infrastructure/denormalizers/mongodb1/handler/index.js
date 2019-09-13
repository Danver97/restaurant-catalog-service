const handlerFunc = require('./event_handlers');

let broker = null;

function exportFunc(eventBroker, db) {
    broker = eventBroker;
    const handler = handlerFunc(db);

    function handleEvents(events) {
        events.forEach(e => {
            function ack() {
                broker.destroyEvent(e);
            }
            broker.hide(e);
            handler(e, ack);
        });
    }
    
    return handleEvents;
}

module.exports = exportFunc;
