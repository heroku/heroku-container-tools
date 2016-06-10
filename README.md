# Heroku container tools CLI plugin

Heroku Toolbelt plugin to push Docker images to the Heroku container registry.

## Installation

```
$ heroku plugins:install heroku-container-tools
```

## Use

See the [Dev Center Documentation](https://devcenter.heroku.com/articles/introduction-local-development-with-docker) for details of use.

```
$ heroku help container
Usage: heroku container

  Use Docker to build and deploy Heroku apps

Additional commands, type "heroku help COMMAND" for more details:

  container:login           #  Logs in to the Heroku container registry
  container:push [PROCESS]  #  Builds, then pushes a Docker image to deploy your Heroku app
```

## Developing and contributing

Checkout the plugin source code and tell the Heroku CLI to use your local version of the plugin (instead of the default one distributed with NPM).

```
$ git clone https://github.com/heroku/heroku-container-tools.git
$ cd heroku-container-tools
$ npm install
$ heroku plugins:link .
```
