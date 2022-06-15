## Start

```shell
docker build -t xstate .
docker run -it -p 3000:3000 xstate
```

## API

```http request
POST http://localhost:3000/start
```

```http request
POST http://localhost:3000/next
Content-Type: application/json

{
  "type": "SELECT",
  "data": "nordea"
}
```

```http request
POST http://localhost:3000/next
Content-Type: application/json

{
  "type": "INPUT",
  "data": {
    "name": "test",
    "password": "password"
  }
}
```
