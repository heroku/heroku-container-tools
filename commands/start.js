var path = require('path');
var child = require('child_process');
var url = require('url');
var colors = require('colors');
var docker = require('../lib/docker');

var TEMPLATE_PATH = path.resolve(__dirname, '../templates/start-Dockerfile');

module.exports = function(topic) {
  return {
    topic: topic,
    command: 'start',
    description: 'builds a Node.js app based on the cedar-14 image',
    help: `help text for ${topic}:start`,
    run: function(context) {
      var startImageId = docker.ensureStartImage(context.cwd);
      startImage(startImageId);
    }
  };
};

function startImage(imageId) {
  console.log('\nstarting image...');
  console.log('web process will be available at', colors.yellow.underline(getURL()));
  
  child.execSync(`docker run -p 3000:3000 --rm -it ${imageId} || true`, {
    stdio: [0, 1, 2]
  });
}

function getURL() {
  var host = url.parse(process.env.DOCKER_HOST).hostname;
  return `http://${host}:3000`;
}
