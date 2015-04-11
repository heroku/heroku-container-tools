var path = require('path');
var child = require('child_process');
var fs = require('fs');
var _ = require('lodash');
var uuid = require('node-uuid');
var crypto = require('crypto');

const FILENAME = 'Dockerfile';

module.exports = {
  buildEphemeralImage: buildEphemeralImage,
  writeDockerfile: writeDockerfile,
  buildImage: buildImage,
  filename: FILENAME,
  ensureExecImage: ensureExecImage
};

function buildEphemeralImage(dir, contents) {
  var filename = `Dockerfile-${uuid.v1()}`;
  var imageId = `heroku-docker-${uuid.v1()}`;
  var dockerfile = path.join(dir, filename);
  fs.writeFileSync(dockerfile, contents, { encoding: 'utf8' });
  buildImage(dir, imageId, dockerfile);
  fs.unlinkSync(dockerfile);
  return imageId;
}

function writeDockerfile(filePath, templatePath, values) {
  console.log('creating Dockerfile...');
  var template = fs.readFileSync(templatePath, { encoding: 'utf8' });
  var compiled = _.template(template);
  var dockerfile = compiled(values || {});
  fs.writeFileSync(filePath, dockerfile, { encoding: 'utf8' });
}

function buildImage(dir, id, dockerfile) {
  console.log('building image...');
  var dockerfile = dockerfile || path.join(dir, FILENAME);
  var build = child.execSync(`docker build --force-rm --file="${dockerfile}" --tag="${id}" ${dir}`, {
    stdio: [0, 1, 2]
  });
  return id;
}

function ensureExecImage(dir) {
  var dockerfile = path.join(dir, FILENAME);
  var contents = fs.readFileSync(dockerfile, { encoding: 'utf8' });
  var hash = createHash(contents);
  var imageId = getImageId(hash);
  imageExists(imageId) || buildImage(dir, imageId);
  return imageId;
}

function createHash(contents) {
  var md5 = crypto.createHash('md5');
  md5.update(contents, 'utf8');
  var digest = md5.digest('hex');
  return digest;
}

function getImageId(hash) {
  return `heroku-docker-${hash}`;
}

function imageExists(id) {
  return getAllImages().indexOf(id) !== -1;
}

function getAllImages() {
  var stdout = child.execSync(`docker images`, { encoding: 'utf8' });
  return _.map(_.filter(stdout.split('\n'), isImage), lineToId);

  function isImage(line) {
    return line.indexOf('heroku-docker') === 0;
  }

  function lineToId(line) {
    return line.split(' ')[0];
  }
}
