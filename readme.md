# Compose Test

Trying out heroku-docker with docker-compose

You can also just clone [a simple example](https://github.com/hunterloftis/asciify).

## Installation

```
$ git clone https://github.com/heroku/heroku-docker.git
$ cd heroku-docker
$ npm install
$ heroku plugins:link
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

### 5. Open your web service

```
$ open "http://$(boot2docker ip)"
```
