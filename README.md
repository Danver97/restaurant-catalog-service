# restaurant-catalog-service
A restaurant catalog management microservice. Created using ExpressJs and tested using assert, mocha and supertest.

The target of this project was to get a deeper understanding of the microservice architecture as well as other concepts related to a distributed environment hosted in the cloud.

The microservice is implemented using the following patterns:
- Event Sourcing
- Command Query Responsibility Segregation
- Onion architecture

## Event Store

For testing purposes, the microservice relies on an in-memory mocked event store database (you can find it under `restaurant-catalog-service/lib/eventSourcing/eventStore/testdb`).

For production purposes, it relies on Amazon DynamoDB or any other event store that implements the following [interface]().

## CQRS

This pattern was chosen for its flexibility in creating new data projections starting from event streams.

## Setup

### Build
`npm install`

### Run
`npm start`

### Test
`npm test`

## News

**Update 03/11/2018: Introduced support for AWS**

Introduced support for AWS. Under `/lib/AWS` it's possible to find a module used for create the AWS infrastructure used as Event Store and Event Broker for an event sourcing platform. The purpose for this module is to ensure that every AWS service is configured properly before starting accepting requests.

A big part of the entire project is still under development. In particular everything about events replay and event aggregates' projections aren't implemented yet. For now, the main design is:
- Replay events from the event store (on AWS: DynamoDB) (this stage is optional if the projection is "up to date")
- Enqueue them in an event broker (on AWS: SQS)
- Poll the event broker and make events deduplication & idempotency checks before applying them on the projection.

The main focus is now in having everything tested properly and ensure that the project is still "infrastructure independent": the goal is to define an interface for event store and event broker in order to easily move from the cloud to a local deployment (or from one cloud provider to another) just using new implementations for event store and event broker. (**Done: 21/11/2018**)

