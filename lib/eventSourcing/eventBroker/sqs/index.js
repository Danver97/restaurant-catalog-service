// const ENV = require('../../../../src/env');
const AWSinit = require('../../../../lib/AWS');
const Promisify = require('../../../../lib/utils').promisify;
const SqsEvent = require('./sqsEvent');

const snsConfig = AWSinit.sns;
const sqsConfig = AWSinit.sqs;
const sqs = sqsConfig.sqs;

// Broker methods implementation

function get(cb) {
    return Promisify(async () => {
        const url = await sqsConfig.getQueueUrl();
        const message = await sqs.receiveMessage({
            QueueUrl: url,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20,
        }).promise();
        const event = message.Body;
        event.MessageId = message.MessageId;
        event.ReceiptHandle = message.ReceiptHandle;
        return SqsEvent.fromObject(event);
    }, cb);
}

function hide(e, cb) {
    return Promisify(() => {}, cb);
}

function remove(e, cb) {
    return Promisify(async () => {
        const url = await sqsConfig.getQueueUrl();
        const params = {
            QueueUrl: url,
            ReceiptHandle: e.receiptHandle,
        };
        await sqs.deleteMessage(params).promise();
    }, cb);
}

function poll(eventHandler, ms) {
    setInterval(() => get(eventHandler), ms || 10000);
}

function subscribe(topic, cb) {
    return Promisify(async () => {
        const arns = await Promise.all([snsConfig.getTopicArn(topic), sqsConfig.getQueueArn()]);
        const topicArn = arns[0]; // await snsConfig.getTopicArn(topic);
        const sqsQueueArn = arns[1]; // await sqsConfig.getQueueArn();
        await snsConfig.subscribe(topicArn, { Endpoint: sqsQueueArn });
    }, cb);
}

module.exports = {
    sqs,
    get,
    hide,
    remove,
    poll,
    subscribe,
};
