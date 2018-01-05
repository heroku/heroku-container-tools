var pkg = require('./package.json');

module.exports = {
  commands: [{
    topic: 'container',
    hidden: true,
    run: () => console.log('noop!')
  }]
};
