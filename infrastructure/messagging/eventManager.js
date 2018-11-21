const broker = require('../../lib/eventSourcing/eventBroker');
const store = require('../repository/repositoryManager')();

const eventHandlers = require('../../domain/logic/eventHandlers')(store);

function handler(e) {
    if (eventHandlers[e.message]) {
        try {
            eventHandlers[e.message](e);
        } catch (err) {
            if (err.message === 'eventOutOfOrder')
                broker.ignoreEvent(e);
        }
    } else
        broker.destroyEvent(e);
}

broker.poll(handler);
