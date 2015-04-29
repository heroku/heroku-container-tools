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
        // TODO: The user's home folder will likely be on 'C:', but we shouldn't assume that
        cwd = cwd.replace('C:\\', '/c/').replace(/\\/g, '/');
    }
    return cwd;
}
