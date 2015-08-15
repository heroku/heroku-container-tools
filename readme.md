# Heroku Docker CLI plugin

Heroku Toolbelt plugin to help configure, test and release apps to Heroku using Docker and Docker Compose.

See the [Dev Center Documentation](https://devcenter.heroku.com/articles/introduction-local-development-with-docker) for details of use.

## Workflow

### 1. Install

    heroku plugins:install heroku-docker

### 2. app.json

Create an app.json file with an `image` key and an `addons` array.
`image` should refer a Heroku-compatible Docker image either from [Docker Hub](https://hub.docker.com/u/heroku/) or of your own devising:

```json
{
  "name": "Example Name",
  "description": "An example app.json for heroku-docker",
  "image": "heroku/nodejs",
  "addons": [ "heroku-redis", "heroku-postgresql" ]
}
```

### 3. Procfile

Create a Procfile as usual:

```
web: node server.js
worker: node worker.js
```

A Procfile is required for the plugin to determine what containers to run for your app.

### 4. Initialize Docker assets for the app

```
$ heroku docker:init
Wrote Dockerfile
Wrote docker-compose.yml
```

The plugin uses the contents of `app.json` and `Procfile` set up a development enviroment for your app.

### 5. Start containers to run your app

```
$ docker-compose up web worker
```

Note how Docker Compose ensures that containers for supported add-ons specified in `app.json` are started and linked to your app process containers.

### 5. Access the web container

```
$ open "http://$(docker-machine ip default):8080"
```

### 7. Get shell access

The plugin will configure a `shell` container process that you can use to get shell access to containers running your app.
This is handy for completing administrative tasks (eg. for a Rails app):

    $ docker-compose run shell
    $ bundle exec rake db:migrate

### 8. Edit with a normal local workflow

```
$ docker-compose run --service-ports shell
```

## Developing and contributing

Checkout the plugin source code and tell the Heroku CLI to use your local version of the plugin (instead of the default one distributed with NPM).

```
$ git clone https://github.com/heroku/heroku-docker.git
$ cd heroku-docker
$ git checkout compose
$ npm install
$ heroku plugins:link .
```

### Add-ons

The mapping from Heroku add-on specified in `app.json` to container configured in `docker-composer.yml` is tracked in `lib\app.json`.
The mapping currently includes a limited subset of add-ons that we have tested. We welcome additions in the form of PRs.