var fs = require('fs');
var path = require('path');
var child = require('child_process');
var _ = require('lodash');
var exists = require('is-there');
var state = require('../lib/state');
var docker = require('../lib/docker');
var platforms = require('../lib/platforms');

module.exports = function(topic) {
  return {
    topic: topic,
    command: 'create',
    description: 'creates a local development environment',
    help: `help text for ${topic}:create`,
    flags: platforms.getFlags(),
    run: function(context) {
      var dockerfile = path.join(context.cwd, 'Dockerfile');
      var lang = templatize(context.args, dockerfile, context.cwd) ||
                 hasDockerfile(dockerfile) ||
                 platforms.detect(context.cwd);

      if (!lang) {
        throw new Error('No language flag, Dockerfile, or matching language detected');
      }

      console.log('lang:', lang);
      return;

      var imageId = docker.buildImage(context.cwd, dockerfile);
      state.set(context.cwd, { runImageId: imageId });
    }
  };
};

function templatize(args, dockerfile, dir) {
  var match = platforms.match(Object.keys(args));
  if (!match) return;

  fs.writeFileSync(dockerfile, match.getDockerfile(dir, args));
  return match.name;
}

function hasDockerfile(dockerfile) {
  if (exists.sync(dockerfile)) return 'Dockerfile';
}
