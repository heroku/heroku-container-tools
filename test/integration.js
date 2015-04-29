var assert = require('chai').assert;
var fse = require('fs-extra');
var os = require('os');
var path = require('path');
var uuid = require('uuid');

var init = require('../commands/init')('test');
var exec = require('../commands/exec');
var start = require('../commands/start');
var release = require('../commands/release');
var clean = require('../commands/clean');

describe('basic integration', function() {
  var cwd = createFixture('basic');
  describe('init', function() {
    var result = init.run({ cwd: cwd, args: {} });
    it('should create a node app', function() {
      assert.equal(result, 'node');
    });
    it('should create a Dockerfile', function() {
      var Dockerfile = path.join(cwd, 'Dockerfile');
      assert.ok(fse.existsSync(Dockerfile));
    });
  })
});

// init(context);
// exec(context, 'node -v');
// start(context);
// release(context);
// clean(context);

function createFixture(name) {
  var source = path.join(__dirname, 'fixtures', name);
  var dest = path.join(os.tmpdir(), uuid.v1());
  fse.ensureDirSync(dest);
  fse.copySync(source, dest);
  return dest;
}
