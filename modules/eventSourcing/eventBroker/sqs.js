// const ENV = require('../../../../src/env');
const AWSinit = require('../../../lib/AWS');
const Promisify = require('../../../lib/utils').promisify;

const sqsConfig = AWSinit.sqs;
const sqs = sqsConfig.sqs;
// const sqs = new SQS(sqsParams);

function get(cb) {
    return Promisify(async () => {
        const url = await sqsConfig.getQueueUrl();
        const message = await sqs.receiveMessage({
            QueueUrl: url,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20,
        }).promise();
        return message;
    }, cb);
}

module.exports = {
    sqs,
    get,
};
