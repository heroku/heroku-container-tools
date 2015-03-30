var fs = require('fs');
var path = require('path');
var child = require('child_process');
var _ = require('lodash');
var state = require('../lib/state');
var docker = require('../lib/docker');

const TEMPLATE_PATH = path.resolve(__dirname, '../templates/run-Dockerfile');

module.exports = function(topic) {
  return {
    topic: topic,
    command: 'create',
    description: 'creates a local development environment',
    help: `help text for ${topic}:create`,
    flags: [
      { name: 'node', description: 'create a Dockerfile for node.js applications'}
    ],
    run: function(context) {
      console.log('context:', context);
      // TODO: parse package.json, look for engines.node, use that or default to 0.10.36
      var dockerfile = path.join(context.cwd, 'Dockerfile');
      docker.writeDockerfile(dockerfile, TEMPLATE_PATH, {
        node_engine: '0.10.36'
      });
      var imageId = docker.buildImage(dir, dockerfile);
      state.set(context.cwd, { runImageId: imageId });
    }
  };
};
