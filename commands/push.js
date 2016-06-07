'use strict';

const cli = require('heroku-cli-util');
const co = require('co');
const child = require('child_process');

module.exports = function(topic) {
  return {
    topic: topic,
    command: 'push',
    description: 'Builds, then pushes a Docker image to deploy your Heroku app',
    needsApp: true,
    needsAuth: true,
    args: [{ name: 'process', optional: true }],
    run: cli.command(co.wrap(push))
  };
};

function* push(context, heroku) {
  let herokuHost = process.env.HEROKU_HOST || 'heroku.com';
  let registry = `registry.${ herokuHost }`;
  let proc = context.args.process || 'web';
  let resource = `${ registry }/${ context.app }/${ proc }`;

  try {
    let build = yield buildImage(resource, context.cwd);
  }
  catch (err) {
    cli.error(`Error: docker build exited with ${ err }`);
    process.exit(1);
  }

  try {
    let push = yield pushImage(resource);
  }
  catch (err) {
    cli.error(`Error: docker push exited with ${ err }`);
    process.exit(1);
  }
}

function buildImage(resource, cwd) {
  return new Promise((resolve, reject) => {
    let args = [
      'build',
      '-t',
      resource,
      cwd
    ];
    child.spawn('docker', args, { stdio: 'inherit' })
      .on('exit', (code, signal) => {
        if (signal || code) reject(signal || code);
        else resolve();
      });
  });
}

function pushImage(resource) {
  return new Promise((resolve, reject) => {
    let args = [
      'push',
      resource
    ];
    child.spawn('docker', args, { stdio: 'inherit' })
      .on('exit', (code, signal) => {
        if (signal || code) reject(signal || code);
        else resolve();
      });
  });
}
