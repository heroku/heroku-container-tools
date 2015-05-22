# Compose Test

```
$ heroku plugins:install heroku-docker
```

## Workflow

### 1. app.json

Create an app.json file with an `image` key and an `addons` array:

```json
{
  "name": "Example Name",
  "description": "An example app.json for heroku-docker",
  "image": "hunterloftis/node",
  "addons": [ "heroku-redis", "heroku-postgresql" ]
}
```

### 2. Procfile

Create a Procfile as usual:

```
web: node server.js
worker: node worker.js
```

### 3. Initialize Docker assets for the app

```
$ heroku docker:init
Wrote Dockerfile
Wrote docker-compose.yml
```

### 4. Start your local cloud

```
$ docker-compose up
```
