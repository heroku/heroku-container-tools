var child = require('child_process');
var fs = require('fs');
var path = require('path');
var os = require('os');
var docker = require('../lib/docker');
var directory = require('../lib/directory');

module.exports = function(topic) {
  return {
    topic: topic,
    command: 'exec',
    description: 'run command in development Docker container',
    help: 'Run command in Docker container with the current working directory mounted',
    variableArgs: true,
    run: function(context) {
      var execImageId = docker.ensureExecImage(context.cwd);
      if (!execImageId) return;
      var command = context.args.join(' ');
      docker.runImage(execImageId, context.cwd, command, true);
    }
  };
};

function crossPlatformCwd(cwd){
    if (os.platform() == 'win32') {
        // this is due to how volumes are mounted by boot2docker/virtualbox
        var p = path.parse(cwd);
        return "/" + p.root.split(':')[0].toLowerCase() + "/" + p.dir.substring(p.root.length).replace(/\\/g, '/') + '/' + p.base;
    }
    return cwd;
}
