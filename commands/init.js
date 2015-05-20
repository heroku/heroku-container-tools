var fs = require('fs');
var path = require('path');
var child = require('child_process');
var _ = require('lodash');
var exists = require('is-there');
var util = require('heroku-cli-util');
var docker = require('../lib/docker');
var platforms = require('../platforms');
var safely = require('../lib/safely');
var directory = require('../lib/directory');
var YAML = require('yamljs');
var camelcase = require('camelcase');

const ADDON_IMAGES = {
  'herokuRedis': 'redis',
  'herokuPostgresql': 'postgres'
};

module.exports = function(topic) {
  return {
    topic: topic,
    command: 'init',
    description: 'create Dockerfile for app',
    help: 'Creates a Dockerfile matching the language and framework for the app',
    flags: [
      { name: 'template', description: 'create a Dockerfile based on a language template', hasValue: true }
    ],
    run: safely(init)
  };
};

function init(context) {
  createDockerfile(context.cwd, context.args.template);
  createDockerCompose(context.cwd);
}

function createDockerfile(dir, lang) {
  var dockerfile = path.join(dir, docker.filename);
  var appJson = JSON.parse(fs.readFileSync(path.join(dir, 'app.json'), { encoding: 'utf8' }));
  var platforms = _.map(appJson.platforms, getDockerfileContents);
  var template = _.template(fs.readFileSync(path.join(__dirname, '../templates/Dockerfile.t')))
  var contents = template({
    platforms: platforms.join('\n')
  });

  try {
    fs.statSync(dockerfile);
    util.log(`Overwriting existing '${ docker.filename }'`);
  }
  catch (e) {}

  fs.writeFileSync(dockerfile, contents, { encoding: 'utf8' });
  util.log(`Wrote Dockerfile (${ docker.filename }; ${ appJson.platforms.join(', ') })`);

  function getDockerfileContents(platform) {
    var name = platform.split(':')[0];
    var template = _.template(fs.readFileSync(path.join(__dirname, `../templates/${ name }.t`), { encoding: 'utf8' }));
    return template();
  }
}

function createDockerCompose(dir) {
  var procfile = directory.readProcfile(dir);
  if (!procfile) throw new Error('Procfile required. Aborting');

  var appJson = JSON.parse(fs.readFileSync(path.join(dir, 'app.json'), { encoding: 'utf8' }));
  var composeFile = path.join(dir, docker.composeFilename);
  var port = 3000;
  var envFile = undefined; // '.env'
  var links = _.map(appJson.addons || [], addonToLink);
  var processes = _.mapValues(procfile, processToService);
  var addons = _.zipObject(links, _.map(links, addonToService));
  var services = _.extend({}, processes, addons);
  var contents = YAML.stringify(services, 4, 2);

  fs.writeFileSync(composeFile, contents, { encoding: 'utf8' });
  util.log(`Wrote docker-compose file (${ docker.composeFilename })`);

  function addonToLink(addon) {
    return camelcase(addon);
  }

  function processToService(command, procName, obj) {
    var proc = {
      build: '.',
      // dockerfile: docker.filename, (TODO: add this once docker-compose 1.3.0 is released)
      command: command,
      environment: { PORT: port },
      ports: [`${ port }:${ port }`]
    };
    if (links.length) proc.links = links;
    if (envFile) proc.env_file = envFile;
    port++;
    return proc;
  }

  function addonToService(addon) {
    return {
      image: ADDON_IMAGES[addon]
    };
  }
}
