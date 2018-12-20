class Event {
    constructor(streamId, eventId, message, payload, sequenceNumber) {
        if (!streamId || !eventId || !message || !payload || !sequenceNumber)
            throw new Error('EventBroker Event: Missing one of constructor parameters');
        this.streamId = streamId;
        this.eventId = eventId;
        this.message = message;
        this.payload = payload;
        this.sequenceNumber = sequenceNumber;
    }
}

module.exports = Event;
