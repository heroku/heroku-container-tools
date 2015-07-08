var child = require('child_process');
var path = require('path');
var os = require('os');
var fs = require('fs');
var Heroku = require('heroku-client');
var request = require('request');
var agent = require('superagent');
var cli = require('heroku-cli-util');
var _ = require('lodash');
var directory = require('../lib/directory');
var docker = require('../lib/docker');
var safely = require('../lib/safely');

module.exports = function(topic) {
  return {
    topic: topic,
    command: 'release',
    description: 'create and release slug to app',
    help: 'Create slug tarball from Docker image and release it to Heroku app',
    needsApp: true,
    needsAuth: true,
    run: safely(release)
  };
};

function release(context) {
  var procfile = directory.readProcfile(context.cwd);
  var modifiedProc = _.mapValues(procfile, prependUser);
  var heroku = context.heroku || new Heroku({ token: context.auth.password });
  var app = context.heroku ? context.app : heroku.apps(context.app);
  request = context.request || request;

  if (!procfile) throw new Error('Procfile required. Aborting');

  return app.info()
    .then(createLocalSlug)
    .then(createRemoteSlug)
    .then(uploadSlug)
    .then(releaseSlug);

  function prependUser(cmd) {
    return `cd user && ${ cmd }`
  }

  function createLocalSlug() {
    cli.log('creating local slug...');

    return new Promise(function(resolve, reject) {
      var slugPath = os.tmpdir();
      var output = '';
      var build = child.spawn('docker-compose', ['build', 'web']);

      build.stdout.pipe(process.stdout);
      build.stderr.pipe(process.stderr);
      build.stdout.on('data', saveOutput);
      build.on('exit', onBuildExit);

      function saveOutput(data) {
        output += data;
      }

      function onBuildExit(code) {
        if (code !== 0) throw new Error('Build failed');
        var tokens = output.match(/\S+/g);
        var imageId = tokens[tokens.length - 1];
        tar(imageId);
      }

      function tar(imageId) {
        cli.log('extracting slug from container...');
        var containerId = child.execSync(`docker run -d ${imageId} tar cfvz /tmp/slug.tgz -C / --exclude=.git ./app`, {
          encoding: 'utf8'
        }).trim();
        child.execSync(`docker wait ${containerId}`);
        child.execSync(`docker cp ${containerId}:/tmp/slug.tgz ${slugPath}`);
        child.execSync(`docker rm -f ${containerId}`);
        resolve(path.join(slugPath, 'slug.tgz'));
      }
    });
  }

  function createRemoteSlug(slugPath) {
    console.log('path:', slugPath);
    cli.log('creating remote slug...');
    cli.log('remote process types:', modifiedProc);
    var slugInfo = app.slugs().create({
      process_types: modifiedProc
    });
    return Promise.all([slugPath, slugInfo])
  }

  function uploadSlug(slug) {
    cli.log('uploading slug...');
    var slugPath = slug[0];
    var slugInfo = slug[1];
    var size = fs.statSync(slugPath).size;

    return new Promise(function(resolve, reject) {
      var outStream = request({
        method: 'PUT',
        url: slugInfo.blob.url,
        headers: {
          'content-type': '',
          'content-length': size
        }
      });

      fs.createReadStream(slugPath)
        .on('error', reject)
        .pipe(outStream)
        .on('error', reject)
        .on('response', resolve.bind(this, slugInfo.id));
    });
  }

  function releaseSlug(id) {
    cli.log('releasing slug...');
    return app.releases().create({
      slug: id
    });
  }
}
