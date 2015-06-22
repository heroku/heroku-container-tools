var pkg = require('./package.json');

const TOPIC = 'docker';

module.exports = {
  commands: [{
      topic: TOPIC,
      description: pkg.description,
      help: pkg.description,
      run: showVersion
    },

    require('./commands/init')(TOPIC)
  ]
};

function showVersion(context) {
  console.log(pkg.version);
}
