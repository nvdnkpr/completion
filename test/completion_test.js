var assert = require('assert');
var Completion = require('../');
var testUtils = require('./utils/index');

// DEV: Internal util test
// TODO: We should break this into another lib
describe('A command', function () {
  before(function () {
    this.command = 'git ad|README';
  });
  describe('broken down into parameters', function () {
    before(function () {
      this.params = testUtils.commandToParams(this.command);
    });
    it('is as expected', function () {
      assert.deepEqual(this.params, {
        cursor: 6,
        line: 'git adREADME'
      });
    });
  });
});

function completeCommand() {
  before(function (done) {
    var that = this;
    this.completion.complete(this.params, function (err, results) {
      that.actual = results;
      done(err);
    });
  });
}

function assertExpected() {
  assert.deepEqual(this.actual, this.expected);
}

describe('A partial command with one completion match', function () {
  before(function () {
    this.params = testUtils.commandToParams('npm pub|');
    this.expected = ['publish'];
    this.completion = new Completion({
      npm: {
        publish: null
      }
    });
  });

  describe('being completed', function () {
    completeCommand();
    it('returns its match', assertExpected);
  });
});

describe('A partial command with multiple completions', function () {
  before(function () {
    this.params = testUtils.commandToParams('git ch|');
    this.expected = ['checkout', 'cherry-pick'];
    this.completion = new Completion({
      git: {
        checkout: function (params, cb) {
          cb(null, ['hello.world']);
        },
        'cherry-pick': function (params, cb) {
          cb(null, ['maraschino']);
        }
      }
    });
  });

  describe('being completed', function () {
    completeCommand();
    it('returns all of its matches', assertExpected);
  });
});

describe('A partial command in junction with the item', function () {
  before(function () {
    this.params = testUtils.commandToParams('git che|world');
    this.expected = ['checkout', 'cherry-pick'];
    this.completion = new Completion({
      git: {
        checkout: function (params, cb) {
          cb(null, ['hello.world']);
        },
        'cherry-pick': function (params, cb) {
          cb(null, ['maraschino']);
        }
      }
    });
  });

  describe('being completed', function () {
    completeCommand();
    it('returns the command\'s match', assertExpected);
  });
});

describe('A terminal command', function () {
  before(function () {
    this.params = testUtils.commandToParams('npm publish|');
    this.expected = ['publish'];
    this.completion = new Completion({
      npm: {
        publish: null
      }
    });
  });

  describe('being completed', function () {
    completeCommand();
    it('returns the command (for spacing)', assertExpected);
  });
});

describe('A terminal command with whitespace', function () {
  before(function () {
    this.params = testUtils.commandToParams('npm publish |');
    this.expected = [];
    this.completion = new Completion({
      npm: {
        publish: null
      }
    });
  });

  describe('being completed', function () {
    completeCommand();
    it('returns nothing', assertExpected);
  });
});

describe('A terminal command with a completion function', function () {
  before(function () {
    this.params = testUtils.commandToParams('git checkout hello|');
    this.expected = ['hello-world', 'hello-there'];
    this.completion = new Completion({
      git: {
        checkout: function (params, cb) {
          cb(null, ['hello-world', 'hello-there']);
        }
      }
    });
  });

  describe('being completed', function () {
    completeCommand();
    it('returns the results of the completion', assertExpected);
  });
});
