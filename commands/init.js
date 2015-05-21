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

const ADDON_IMAGES = {
  'heroku-redis': 'redis',
  'heroku-postgresql': 'postgres'
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
  var contents = `FROM ${ appJSON.image }`;

  try {
    fs.statSync(dockerfile);
    util.log(`Overwriting existing '${ docker.filename }'`);
  }
  catch (e) {}

  fs.writeFileSync(dockerfile, contents, { encoding: 'utf8' });
  util.log(`Wrote Dockerfile (${ docker.filename })`);
}

function createDockerCompose(dir) {
  var composeFile = path.join(dir, docker.composeFilename);
  var procfile = directory.readProcfile(dir);
  if (!procfile) throw new Error('Procfile required. Aborting');

  // read app.json to get the app's specification
  var appJSON = JSON.parse(fs.readFileSync(path.join(dir, 'app.json'), { encoding: 'utf8' }));

  // compile a list of addon links
  var links = _.map(appJSON.addons || [], camelcase);

  // compile a list of process services
  var processes = _.mapValues(procfile, processToService(links), { port: 2999 });

  // compile a list of addon services
  var addons = _.zipObject(links, _.map(appJSON.addons, addonToService));

  // combine processes and addons into a list of all services
  var services = _.extend({}, processes, addons);

  // create a docker-compose file from the list of services
  var composeContents = YAML.stringify(services, 4, 2);

  fs.writeFileSync(composeFile, composeContents, { encoding: 'utf8' });
  util.log(`Wrote docker-compose file (${ docker.composeFilename })`);

  function processToService(links) {
    return function(command) {
      this.port++;
      return _.pick({
        build: '.',
        command: command,
        dockerfile: undefined,                          // TODO: docker.filename (once docker-compose 1.3.0 is released)
        environment: { PORT: this.port },
        ports: [`${ this.port }:${ this.port }`],
        links: links.length ? links : undefined,
        envFile: undefined,                             // TODO: detect an envFile?
        volumes: [ '.:/app/user' ]
      }, _.identity);
    };
  }

  function addonToService(addon) {
    return {
      image: ADDON_IMAGES[addon]
    };
  }
}
