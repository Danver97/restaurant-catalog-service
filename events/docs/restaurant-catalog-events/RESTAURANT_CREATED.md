# Restaurant Created Event
As described in [Base Event](../BASE_EVENT.md) the only field that would be described is `payload`. The `message` value will be `restaurantCreated` (**camelCase**).

## Payload
Will follow the following format:
```
{
    ...
    "payload": {
        "restId": string,
        "owner": string,
        "timeTable": {
            "Monday": {
            	"morning": {
                    "open": string,
                    "close": string,
            	},
            	"afternoon": {
                    "open": string,
                    "close": string,
            	}
            },
            ...
            "Sunday": {...},
        },
        "tables": [],
    }
}
```
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `restId` | string | Yes | The restaurant's id (will have the same value of `streamId`) |
| `owner` | string | Yes | The owner userId |
| `timeTable` | object | Yes | The restaurant's timetable. |
| `tables` | array | Yes | The restaurant's table. It's an empty array. |
