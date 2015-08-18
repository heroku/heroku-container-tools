var path = require('path');
var fs = require('fs');

module.exports = function(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'app.json'), { encoding: 'utf8' })):
  } catch(e) {
    return {};
  }
}
