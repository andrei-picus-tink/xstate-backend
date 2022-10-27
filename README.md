## Start

Deployed at https://xstate-bff2.onrender.com.

To start it locally:

```shell
yarn
yarn dev
```

or 

```shell
docker build -t xstate .
docker run -it -p 3000:3000 xstate
```

## API

The API always responds with `{ value, context }`:
- `value`: A unique name identifying the current state.
- `context`: Information that you can use to present something to the user and/or ask for input. Check the `Context` type in [the machine](./machine.ts).

```http request
POST http://localhost:3000/start
```

```http request
POST http://localhost:3000/next
Content-Type: application/json

{
  "sessionId": "foo",
  "type": "SELECT",
  "data": "password"
}
```

```http request
POST http://localhost:3000/next?sessionId=foo
Content-Type: application/json

{
  "sessionId": "foo",
  "type": "INPUT",
  "data": {
    "name": "test",
    "password": "password"
  }
}
```
