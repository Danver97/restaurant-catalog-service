const Event = require('./event');
const Promisify = require('../../../lib/utils').promisify;

let queue = [];
const visibilityTimeout = 15000;

function log(silent) {
    if (!silent)
        console.log(queue);
    return queue;
}

function enqueueEvent(e) {
    queue.push(e);
}

function dequeueEvent(timeout) {
    const e = queue.shift();
    setTimeout(() => queue.splice(0, 0, e), timeout || visibilityTimeout);
    return Event.fromObject(e);
}

function dequeueEvents(number, timeout) {
    if (!number)
        return dequeueEvent(timeout);
    const events = [];
    for (let i = 0; i < number; i++)
        events.push(dequeueEvent(timeout));
    return events;
}

// Broker methods implementation

function get(cb) {
    return Promisify(dequeueEvents, cb);
}

function hide(e, cb) {
    return Promisify(() => {}, cb);
}

function remove(e, cb) {
    return Promisify(() => { queue = queue.filter(ev => ev.id !== e.id); }, cb);
}

function poll(eventHandler, ms) {
    setInterval(() => get(eventHandler), ms || 10000);
}

function subscribe(topic, cb) {
    // process.on(topic, enqueueEvent);
}

module.exports = {
    get,
    hide,
    remove,
    poll,
    subscribe,
    log,
};
