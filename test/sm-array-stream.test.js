var ArrayStream = require("../");
var async = require('async');

module.exports = {
    testConstructor: testConstructor,
    testBasicStream: testBasicStream,
    testSet: testSet,
    testControlFlow: testControlFlow,
    testDuplex: testDuplex
};

function testConstructor(assert) {
    assert.ok(new ArrayStream());
    assert.ok(new ArrayStream([]));
    assert.ok(new ArrayStream([1, 2, 3]));
    assert.ok(new ArrayStream([1, 2, 3], {
        highWaterMark: 10
    }));
    assert.done();
}

function testBasicStream(assert) {
    var arr = [1, 2, 3],
        stream = new ArrayStream(arr),
        index = 0;

    stream.on('data', function(chunk) {
        assert.strictEqual(chunk, arr[index++]);
    });

    stream.once('end', function() {
        assert.strictEqual(index, 3);
        assert.done();
    });
}

function testSet(assert) {
    var arr = [1, 2, 3],
        stream = new ArrayStream(),
        index = 0;

    stream.pause();

    stream.on('data', function(chunk) {
        assert.strictEqual(chunk, arr[index++]);
    });

    stream.once('end', function() {
        assert.strictEqual(index, 3);
        assert.done();
    });

    stream.set(arr);
    stream.resume();
}

function testControlFlow(assert) {
    var arr = [1, 2, 3],
        stream = new ArrayStream(arr),
        index = 0;

    stream.pause();

    stream.on('data', function(chunk) {
        assert.strictEqual(chunk, arr[index++]);
    });

    stream.once('end', function() {
        assert.done();
    });

    setTimeout(function() {
        assert.strictEqual(index, 0);
        stream.once('data', function(chunk) {
            assert.strictEqual(chunk, arr[index - 1]);
            stream.pause();
            setTimeout(function() {
                assert.strictEqual(index, 1);
                stream.once('data', function(chunk) {
                    assert.strictEqual(chunk, arr[index - 1]);
                    stream.pause();
                    setTimeout(function() {
                        assert.strictEqual(index, 2);
                        stream.resume();
                        stream.close();
                        assert.strictEqual(index, 2);
                    }, 5);
                });
                stream.resume();
            }, 5);
        });
        stream.resume();
    }, 5);
}

function testDuplex(assert) {
    var arr = [1, 2, 3],
        add = [4, 5, 6],
        stream = new ArrayStream(arr, {
            duplex: true
        }),
        index = 0;

    stream.on('data', function(chunk) {
        assert.strictEqual(chunk, arr[index++]);
        if (index === 3) {
            arr.push.apply(arr, add);
            stream.write(add, function() {
                stream.once('data', function(chunk) {
                    assert.strictEqual(index, 4);
                });
                stream.end();
            });
        }
    });

    stream.once('end', function() {
        assert.strictEqual(index, arr.length);
        assert.done();
    });

}

if (!/\bnodeunit$/.test(process.argv[1])) {
    var reporter = require('nodeunit').reporters.default;
    reporter.run({
        test: module.exports
    });
} else if (false) {
    // For debugging purpose
    var assert = require('assert');
    var testSuite = module.exports;
    tests = [];
    for (prop in testSuite) {
        (function(fn) {
            tests.push(function(next) {
                assert.done = next;
                fn(assert);
            });
        })(testSuite[prop]);
    }
    async.series(tests, function() {
        console.log('done');
    });
}