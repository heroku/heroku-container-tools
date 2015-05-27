var fs = require('fs');
var path = require('path');
var child = require('child_process');

var _ = require('lodash');
var exists = require('is-there');
var util = require('heroku-cli-util');
var YAML = require('yamljs');
var camelcase = require('camelcase');

var docker = require('../lib/docker');
var safely = require('../lib/safely');
var directory = require('../lib/directory');

const ADDONS = {
  'heroku-redis': {
    image: 'redis',
    env: { 'REDIS_URL': 'redis://herokuRedis:6379' }
  },
  'heroku-postgresql': {
    image: 'postgres',
    env: { 'DATABASE_URL': 'postgres://postgres:@herokuPostgresql:5432/dev' }
  }
};

module.exports = function(topic) {
  return {
    topic: topic,
    command: 'init',
    description: 'create Dockerfile and docker-compose.yml',
    help: 'Creates a Dockerfile and docker-compose.yml for the app specified in app.json',
    flags: [],
    run: safely(init)
  };
};

function init(context) {
  createDockerfile(context.cwd);
  createDockerCompose(context.cwd);
}

function createDockerfile(dir) {
  var dockerfile = path.join(dir, docker.filename);
  var appJSON = JSON.parse(fs.readFileSync(path.join(dir, 'app.json'), { encoding: 'utf8' }));
  var contents = `FROM ${ appJSON.image }\n`;

  try {
    fs.statSync(dockerfile);
    util.log(`Overwriting existing '${ docker.filename }'`);
  }
  catch (e) {}

  fs.writeFileSync(dockerfile, contents, { encoding: 'utf8' });
  util.log(`Wrote ${ docker.filename }`);
}

function createDockerCompose(dir) {
  var composeFile = path.join(dir, docker.composeFilename);
  var procfile = directory.readProcfile(dir);
  if (!procfile) throw new Error('Procfile required. Aborting');

  try {
    fs.statSync(composeFile);
    util.log(`Overwriting existing '${ docker.composeFilename }'`);
  }
  catch (e) {}

  // read app.json to get the app's specification
  var appJSON = JSON.parse(fs.readFileSync(path.join(dir, 'app.json'), { encoding: 'utf8' }));

  // compile a list of addon links
  var links = _.map(appJSON.addons || [], camelcase);

  // create environment variables to link the addons
  var envs = _.reduce(appJSON.addons, addonsToEnv, {});

  // compile a list of process services
  var processes = _.mapValues(procfile, processToService(links, envs));

  // compile a list of addon services
  var addons = _.zipObject(links, _.map(appJSON.addons, addonToService));

  // combine processes and addons into a list of all services
  var services = _.extend({}, processes, addons);

  // create a docker-compose file from the list of services
  var composeContents = YAML.stringify(services, 4, 2);

  fs.writeFileSync(composeFile, composeContents, { encoding: 'utf8' });
  util.log(`Wrote ${ docker.composeFilename }`);

  function addonsToEnv(env, addon) {
    _.extend(env, ADDONS[addon].env);
    return env;
  }

  function processToService(links, envs) {
    return function(command, procName) {
      var port = procName === 'web' ? '3000' : undefined;
      return _.pick({
        build: '.',
        command: command,
        dockerfile: undefined,                          // TODO: docker.filename (once docker-compose 1.3.0 is released)
        environment: _.extend(port ? { PORT: port } : {}, envs),
        ports: port ? [`${ port }:${ port }`] : undefined,
        links: links.length ? links : undefined,
        envFile: undefined                              // TODO: detect an envFile?
      }, _.identity);
    };
  }

  function addonToService(addon) {
    return {
      image: ADDONS[addon].image
    };
  }
}
