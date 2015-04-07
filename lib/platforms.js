var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var dirs = getDirsSync(path.resolve(__dirname, '../platforms'));
var modules = dirs.map(function(dir) {
  return require(path.resolve(__dirname, '../platforms/', dir));
});

module.exports = {
  getFlags: function() {
    return _.flatten(_.pluck(modules, 'flags'));
  },
  match: function(candidates) {
    return _.find(modules, function(module) {
      return _.intersection(_.pluck(module.flags, 'name'), candidates).length;
    });
  },
  detect: function(dir) {
    return _.reduce(modules, function(match, mod) {
      if (match) return match;
      return mod.detect(dir) ? mod.name : undefined;
    }, undefined);
  }
}

function getDirsSync(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}
