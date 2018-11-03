const AWS = require('aws-sdk/global');
const DDB = require('aws-sdk/clients/dynamodb');

const AWSinit = require('./lib/AWS');

AWS.config.update({ region: 'eu-west-2' });

const dbparams = {
    apiVersion: '2012-08-10',
    endpoint: new AWS.Endpoint('http://localhost:4569'),
};
const dynamodb = new DDB(dbparams);


async function list() {
    console.log(await dynamodb.listTables().promise());
    const tableParams = {
        AttributeDefinitions: [
            {
                AttributeName: 'StreamId',
                AttributeType: 'S',
            },
            {
                AttributeName: 'EventId',
                AttributeType: 'N',
            },
        ],
        KeySchema: [
            {
                AttributeName: 'StreamId',
                KeyType: 'HASH',
            },
            {
                AttributeName: 'EventId',
                KeyType: 'RANGE',
            },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
        TableName: 'restaurantEvents.topic',
        StreamSpecification: {
            StreamEnabled: true,
            StreamViewType: 'NEW_IMAGE', // 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES' | 'KEYS_ONLY',
        },
    };
    try {
        const data = await dynamodb.createTable(tableParams).promise();
        console.log(data.TableDescription.TableArn);
    } catch (e) {
        console.log(e);
    }
}

// list();

async function init() {
    const microserviceName = process.env.MICROSERVICE_NAME;
    const ddb = AWSinit.ddb;
    const sns = AWSinit.sns;
    const sqs = AWSinit.sqs;
    console.log(await ddb.init(microserviceName));
    console.log(await sns.init(microserviceName));
    console.log(await sqs.init(microserviceName));
}

// init();

AWSinit.init();
