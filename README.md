# Heroku Container Tools CLI plugin

**/!\ This plugin is deprecated. Please see our [Container Registry and Runtime](https://devcenter.heroku.com/articles/container-registry-and-runtime) instead.**

Heroku Toolbelt plugin to help configure, test and release apps to Heroku using local containers.

## Installation

```
$ heroku plugins:install heroku-container-tools
```

## Use

```
$ heroku help container
Usage: heroku container

  Use containers to build and deploy Heroku apps

Additional commands, type "heroku help COMMAND" for more details:

  container:init     #  create Dockerfile and docker-compose.yml
  container:release  #  create and release slug to app
```

For help with a particular command:

```
$ heroku help container:init
Usage: heroku container:init

   -i, --image IMAGE   # the Docker image from which to inherit
   -f, --force         # overwrite existing Dockerfile and docker-compose.yml

  Creates a Dockerfile and docker-compose.yml for the app specified in app.json
```

## Developing and contributing

Checkout the plugin source code and tell the Heroku CLI to use your local version of the plugin (instead of the default one distributed with NPM).

```
$ git clone https://github.com/heroku/heroku-container-tools.git
$ cd heroku-container-tools
$ npm install
$ heroku plugins:link .
```

### Add-ons

The mapping from Heroku add-on specified in `app.json` to container configured in `docker-compose.yml` is tracked in `lib\addons.js`.
The mapping currently includes a limited subset of add-ons that we have tested. We welcome additions in the form of PRs.
