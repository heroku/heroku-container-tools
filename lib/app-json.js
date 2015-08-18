var path = require('path');
var fs = require('fs');

module.exports = function(dir) {
  var appJSONPath = path.join(dir, 'app.json');
  if (fs.existsSync(appJSONPath)) {
    return JSON.parse(fs.readFileSync(appJSONPath, { encoding: 'utf8' }));
  } else {
    return {};
  }
};
