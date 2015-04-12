# Node.js Getting Started

## Set up your environment

Get the project:

```
git clone https://github.com/heroku/node-js-getting-started.git
cd node-js-getting-started
```

Ensure that you can connect to Docker in this shell:

```
docker ps
```

## Create a Dockerfile

```
heroku docker:init
```

Heroku-Docker will automatically detect that this project is a Node.js app.

## Work locally with Docker

At this point, you have several available commands.

For example,
you could immediately build the project in Docker and release it to Heroku:

```
heroku create
heroku docker:release
heroku open
```

Or, you could open a shell in Docker to manipulate the project with
commands like `npm install`:

```
heroku docker:exec bash
```

You'll probably want to test the server by simulating Heroku locally:

```
heroku docker:start
heroku docker:open
```
