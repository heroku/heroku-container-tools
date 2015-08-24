var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var exists = require('is-there');


module.exports = {
  name: 'php',
  detect: function(dir) {
    if (exists.sync(path.resolve(dir, 'composer.json'))) return true;
  },
  getDockerfile: function(dir) {
    var templatePath = path.resolve(__dirname, 'Dockerfile.t');
    var template = fs.readFileSync(templatePath, { encoding: 'utf8' });
    var compiled = _.template(template);
    return compiled({});
  }
};
