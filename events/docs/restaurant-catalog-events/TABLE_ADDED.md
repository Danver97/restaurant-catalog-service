# Table Added Event
As described in [Base Event](../BASE_EVENT.md) the only field that would be described is `payload`. The `message` value will be `tableAdded` (**camelCase**).

## Payload
Will follow the following format:
```
{
    ...
    "payload": {
        "tables": [],
    }
}
```
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `tables` | array | Yes | The restaurant's table. It's complete new list of the restaurant's tables. |
