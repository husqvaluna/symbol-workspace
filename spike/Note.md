# Note

- サーバサイドでトランザクションを構築
- 署名者はサーバサイドとしたい
  - 手数料なども負担
- 内容についてユーザーに


https://symbol.fyi/accounts/NAKPKFIL4CK2UTCUTNMY72TZQ2I4VS7C7GZICUI

https://github.com/satoshilabs/slips/blob/master/slip-0044.md

"m/44'/60'/0'/0/0"

- プレーン
- シリアライズ
- 圧縮
- 暗号化



```json
{
  "earthquake": {
    "domesticTsunami": "None",
    "foreignTsunami": "Unknown",
    "hypocenter": {
      "depth": 10,
      "latitude": 32.2,
      "longitude": 130.4,
      "magnitude": 2.2,
      "name": "熊本県天草・芦北地方"
    },
    "maxScale": 20,
    "time": "2025/04/08 09:08:00"
  },
  "issue": {
    "correct": "None",
    "source": "気象庁",
    "time": "2025/04/08 09:11:44",
    "type": "DetailScale"
  },
  "time": "2025/04/08 09:11:44.899"
}
```


## jsonepc

```json
{
  "jsonrpc": "2.0",
  "method": "subtract",
  "params": [42, 23],
  "id": 1
}

{
  "jsonrpc": "2.0",
  "method": "subtract",
  "params": {
    "subtrahend": 23,
    "minuend": 42
  },
  "id": 3
}
```


## JSONSchema

```json
{
  "$id": "https://example.com/complex-object.schema.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Complex Object",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "age": {
      "type": "integer",
      "minimum": 0
    },
    "address": {
      "type": "object",
      "properties": {
        "street": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "state": {
          "type": "string"
        },
        "postalCode": {
          "type": "string",
          "pattern": "\\d{5}"
        }
      },
      "required": ["street", "city", "state", "postalCode"]
    },
    "hobbies": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": ["name", "age"]
}
```


## schema

```json
{
  "$schema": "http://your-service.example.com/schema.json",
}
```
