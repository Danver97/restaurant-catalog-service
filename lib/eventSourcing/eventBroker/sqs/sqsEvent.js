const Event = require('../event');

class SqsEvent extends Event {
    constructor(streamId, eventId, message, payload, sequenceNumber, receiptHandle) {
        super(streamId, eventId, message, payload, sequenceNumber);
        this.receiptHandle = receiptHandle;
    }
    
    static fromObject(obj) {
        const streamId = obj.streamId || obj.StreamId;
        const eventId = obj.eventId || obj.EventId;
        const message = obj.message || obj.Message;
        const payload = obj.payload || obj.Payload;
        const sequenceNumber = obj.sequenceNumber || obj.SequenceNumber;
        const receiptHandle = obj.receiptHandle || obj.ReceiptHandle;
        
        const sqsEvent = new SqsEvent(streamId, eventId, message, payload, sequenceNumber, receiptHandle);
        return sqsEvent;
    }
}

module.exports = SqsEvent;
