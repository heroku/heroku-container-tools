var dotenv = require('dotenv');
var path = require('path');
var yaml = require('yamljs');
var readAppJSON = require('./app-json');

module.exports = {
  readProcfile: readProcfile,
  determineMountDir: determineMountDir
};

function readProcfile(cwd) {
  try {
    var procfilePath = path.join(cwd, 'Procfile');
    return yaml.load(procfilePath);
  }
  catch (e) {}
}

function determineMountDir(dir) {
  var appJSON = readAppJSON(dir);
  return path.join('/app/user', appJSON.mount_dir || '');
}
