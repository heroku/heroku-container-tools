var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var exists = require('is-there');

module.exports = {
  name: 'node',
  flags: [
    { name: 'node', description: 'create a Dockerfile for node.js applications' },
    { name: 'iojs', description: 'create a Dockerfile for iojs applications' }
  ],
  detect: function(dir) {
    if (exists.sync(path.resolve(dir, 'package.json'))) return true;
    if (exists.sync(path.resolve(dir, 'server.js'))) return true;
  },
  getDockerfile: function(dir, args) {
    console.log('getDockerfile args:', args);
    var templatePath = path.resolve(__dirname, 'run-Dockerfile');
    var template = fs.readFileSync(templatePath, { encoding: 'utf8' });
    var compiled = _.template(template);
    // TODO: read node engine from package.json in dir
    return compiled({
      node_engine: '0.10.38'
    });
  }
};
