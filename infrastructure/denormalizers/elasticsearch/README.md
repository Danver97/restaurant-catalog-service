# Restaurant Catalog Service Elasticsearch Denormalizer
This package must be deployed as a serverless function.
It needs some env variables to start.

## Environment Variables

| Variable | Description |
| --- | --- |
| ES_URL | ElasticSearch projection connection string |
| ES_INDEX | ElasticSearch index name |
| ORDER_CONTROL_DB | Order control db name (example: testdb, dynamodb) |
| ORDER_CONTROL_TABLE | Name of the table used for the order control |
| ORDER_CONTROL_DBURL | (Optional) Url to the order control db instace. Used by DynamoDb implementation in case of a local db instance |

## OrderControl Tables Schema
### DynamoDb

| Field | Type | Description |
| --- | --- | --- |
| StreamId | String | StreamId of the event stream |
| LastProcessedEventId | Number | EventId of the last event processed |
