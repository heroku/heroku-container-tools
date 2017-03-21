var fs = require('fs');
var dotenv = require('dotenv');
var path = require('path');
var yaml = require('yamljs');

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
  var appJSONLocation = path.join(dir, 'app.json');
  var appJSON = {};

  if (fs.existsSync(appJSONLocation)) {
    var appJSON = JSON.parse(fs.readFileSync(appJSONLocation));
  }

  return path.join('/app/user', appJSON.mount_dir || '');
}
