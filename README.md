## Getting started

Configure your local environment

```shell
cp env.example .env.local
```

`NEXT_PUBLIC_BASE_URL` defaults to `/api`, which is configured as Next server-side route handler. You can pass through service API keys, overide service and config options within this route.

The example is currently configure to send a request to a local sandbox.

`DAILY_BOTS_URL` is the URL of the start endpoint. This can be set to a local URL in development.