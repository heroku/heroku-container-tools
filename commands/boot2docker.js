var tmpdir = require('os').tmpdir;
var path = require('path');
var fs = require('fs');
var request = require('request');
var child = require('child_process');
var Progress = require('progress');

const BOOT2DOCKER_PKG = 'https://github.com/boot2docker/osx-installer/releases/download/v1.5.0/Boot2Docker-1.5.0.pkg';
const INHERIT_STDIO = { stdio: [0, 1, 2] };
const CHUNK_SIZE = 1024 * 10;

module.exports = function(topic) {
  return {
    topic: topic,
    command: 'boot2docker',
    description: 'installs boot2docker',
    help: `help text for ${topic}:install`,
    run: function(context) {
      stopB2D();
      downloadB2D()
        .then(installB2D)
        .then(showMessage)
        .catch(onFailure);
    }
  };
};

function downloadB2D() {
  console.log('downloading...');

  return new Promise(function(resolve, reject) {
    var outPath = path.join(tmpdir(), 'boot2docker.pkg');
    var size = 0;

    request
      .get(BOOT2DOCKER_PKG, { gzip: true })
      .on('response', onResponse)
      .on('error', reject)
      .pipe(fs.createWriteStream(outPath))
      .on('error', reject)
      .on('finish', resolve.bind(this, outPath));

    function onResponse(res) {
      var len = parseInt(res.headers['content-length'], 10);
      var bar = new Progress('  boot2docker [:bar] :percent', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: len
      });

      res.on('data', function (chunk) {
        bar.tick(chunk.length);
      });

      res.on('end', function () {
        console.log('\n');
      });
    }
  });
}

function installB2D(pkg) {
  try {
    console.log('installing...');
    child.execSync('open -W ' + pkg, INHERIT_STDIO);
    console.log('initializing boot2docker vm...');
    child.execSync('boot2docker init', INHERIT_STDIO);
    console.log('upgrading boot2docker...');
    child.execSync('boot2docker upgrade', INHERIT_STDIO);
    return Promise.resolve();
  }
  catch (e) {
    return Promise.reject(e);
  }
}

function showMessage() {
  console.log('\n\n');
  console.log('Remember to always start boot2docker before using this plugin:\n');
  console.log('boot2docker start');
  console.log('$(boot2docker shellinit)');
  return Promise.resolve();
}

function onFailure(err) {
  console.log('Installation failed:', err.stack);
}
