/* const AWS = require('aws-sdk/global');
const DynamoDb = require('aws-sdk/clients/dynamodb');
const ENV = require('../../src/env'); */
const DynamoDataTypes = require('dynamodb-data-types');
const ddb = require('../../lib/AWS').ddb;

const Promisify = require('../../lib/utils').promisify;
const Restaurant = require('../../models/restaurant');
const restaurantEvents = require('../restaurant-events');

const dynamoAttr = DynamoDataTypes.AttributeValue;

/* const dbparams = { apiVersion: '2012-08-10' };
if (ENV.event_store === 'dynamodb' && ENV.dburl)
    dbparams.endpoint = new AWS.Endpoint(ENV.dburl); 
const dynamoDb = new DynamoDb(dbparams); */

const dynamoDb = ddb.ddb;

let tableArn = null;

async function init() {
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
        TableName: restaurantEvents.topic,
        StreamSpecification: {
            StreamEnabled: true,
            StreamViewType: 'NEW_IMAGE', // 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES' | 'KEYS_ONLY',
        },
    };
    try {
        const data = await dynamoDb.createTable(tableParams).promise();
        tableArn = data.TableDescription.TableArn;
    } catch (e) {
        console.log(e);
        if (e.code === 'ResourceInUseException')
            console.log('DynamoDb table already created.');
        else {
            console.log(e);
            throw e;
        }
    }
}

function removeEmptySetsOrStrings(attrValues) {
    Object.keys(attrValues).forEach(k => {
        if (typeof attrValues[k] !== 'object')
            return;
        if (attrValues[k].S !== undefined && attrValues[k].S === '')
            delete attrValues[k];
        if (attrValues[k].NS && attrValues[k].NS.length === 0)
            delete attrValues[k];
        if (attrValues[k] && attrValues[k].M)
            removeEmptySetsOrStrings(attrValues[k].M);
    });
}

function save(streamId, eventId, message, payload, cb) {
    return Promisify(async () => {
        let eId = eventId || payload._revisionId || 0;
        eId++;
        delete payload._revisionId;
        const attrValues = dynamoAttr.wrap({
            ':sid': streamId,
            ':eid': eId, /* 1 */ // OCCHIO QUIIIII!
            ':message': message,
            ':payload': payload,
        });
        removeEmptySetsOrStrings(attrValues);
        const params = {
            TableName: restaurantEvents.topic,
            Key: dynamoAttr.wrap({ StreamId: streamId, EventId: eId /* 1 */ }), // OCCHIO QUIIIII!
            ExpressionAttributeNames: {
                '#SID': 'StreamId',
                '#EID': 'EventId',
                '#MSG': 'Message',
                '#PL': 'Payload',
            },
            ExpressionAttributeValues: attrValues,
            UpdateExpression: 'SET #MSG = :message, #PL = :payload',
            ConditionExpression: '#SID <> :sid AND #EID <> :eid', // 'attribute_not_exists(StreamId) AND attribute_not_exists(EventId)',
            ReturnValues: 'ALL_NEW',
            ReturnItemCollectionMetrics: 'SIZE',
            ReturnConsumedCapacity: 'INDEXES',
        };
        console.log(JSON.stringify(params.ExpressionAttributeValues));
        await dynamoDb.updateItem(params).promise();
    }, cb);
}

function getStream(streamId, cb) {
    return Promisify(async () => {
        const params = {
            // ConsistentRead: true,
            ExpressionAttributeValues: dynamoAttr.wrap({ ':streamId': streamId, ':start': 0, ':now': Number.MAX_SAFE_INTEGER }),
            KeyConditionExpression: 'StreamId = :streamId AND EventId BETWEEN :start AND :now',
            TableName: restaurantEvents.topic,
        };
        const reply = await dynamoDb.query(params).promise();
        const results = reply.Items.map(i => dynamoAttr.unwrap(i));
        return results;
    }, cb);
}

function persist(event, cb) {
    return save(event.streamId, event.id, event.message, event.payload, cb);
}

function publishEvent(event) {
    return persist(event);
}

function restaurantCreated(rest, cb) {
    return save(rest.id, rest._revisionId, restaurantEvents.restaurantCreated, Object.assign({}, rest), cb);
}

function restaurantRemoved(rest, cb) {
    return save(rest.id, rest._revisionId, restaurantEvents.restaurantRemoved, { id: rest.id }, cb);
}

function tableAdded(rest, tables, cb) {
    return save(rest.id, rest._revisionId, restaurantEvents.tableAdded, { id: rest.id, tables: tables.slice() }, cb);
}

function tableRemoved(rest, tables, cb) {
    return save(rest.id, rest._revisionId, restaurantEvents.tableRemoved, { id: rest.id, tables: tables.slice() }, cb);
}

function getRestaurant(restId, cb) {
    return Promisify(async () => {
        const stream = await getStream(restId);
        let aggregate = {};
        stream.forEach(e => {
            aggregate = Object.assign(aggregate, e.Payload);
        });
        aggregate._revisionId = stream.length - 1;
        return Restaurant.fromObject(aggregate);
    }, cb);
}

function getTableArn() {
    return tableArn;
}

init();

module.exports = {
    dynamoDb,
    getTableArn,
    save,
    restaurantCreated,
    restaurantRemoved,
    tableAdded,
    tableRemoved,
    getRestaurant,
    getStream,
    persist,
    publishEvent,
};
