var fs = require('fs');
var path = require('path');
var glob = require("glob")
var _ = require('lodash');
var exists = require('is-there');

module.exports = {
  name: 'scala',
  detect: function(dir) {
    if (glob.sync('*.sbt', {cwd: dir}).length === 0) return true;
    if (glob.sync('project/*.sbt', {cwd: dir}).length === 0) return true;
    if (glob.sync('project/*.scala', {cwd: dir}).length === 0) return true;
  },
  mounts: function(dir) {
    var cwd = crossPlatformDir(dir);
    var homeDir = crossPlatformUserHome();
    var m2 = crossPlatformDir(path.join(homeDir, ".m2"));
    var ivy2 = crossPlatformDir(path.join(homeDir, ".ivy2"));
    var sbtDir = crossPlatformDir(path.join(homeDir, ".sbt"));
    return [`${cwd}:/app/src`, `${m2}:/app/.m2`, `${ivy2}:/app/.ivy2`, `${sbtDir}:/app/.sbt`];
  },
  getDockerfile: function(dir) {
    var templatePath = path.resolve(__dirname, 'Dockerfile.t');
    var template = fs.readFileSync(templatePath, { encoding: 'utf8' });
    var compiled = _.template(template);
    return compiled({});
  }
};

function crossPlatformDir(dir) {
  if (process.platform == 'win32') {
    // this is due to how volumes are mounted by boot2docker/virtualbox
    var p = path.parse(dir);
    return path.posix.sep + p.root.split(':')[0].toLowerCase() + path.posix.sep
    + p.dir.substring(p.root.length).replaceAll(path.sep, path.posix.sep) + path.posix.sep + p.base;
  }
  return dir;
}

function crossPlatformUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
