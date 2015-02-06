var util = require('util');
var Duplex = require('readable-stream').Duplex;

// http://codewinds.com/blog/2013-08-31-nodejs-duplex-streams.html

var ArrayStream = module.exports = function ArrayStream(arr, options) {
    var self = this;
    this._reading = false;
    this._closing = false;
    this._index = 0;
    options = options || {};
    this._duplex = options.duplex || false;

    this.set(arr);

    Duplex.call(this, {
        objectMode: true,
        highWaterMark: options.highWaterMark || Math.pow(2, 10)
    });
}

util.inherits(ArrayStream, Duplex);

ArrayStream.prototype.end = function() {
    Duplex.prototype.end.apply(this, arguments);
    this.close();
};

ArrayStream.prototype._write = function(chunk, encoding, cb) {
    if (this._duplex) {
        this.performWrite(chunk, encoding, cb);
    }
    return true;
};

ArrayStream.prototype.performWrite = function(chunk, encoding, cb) {
    var hasData = false;
    if (encoding === 'item') {
        hasData = true;
        if (this._buffer) {
            this._buffer.push(chunk);
        } else {
            this._buffer = [chunk];
        }
    } else if (Array.isArray(chunk)) {
        hasData = true;
        if (this._buffer) {
            this._buffer.push.apply(this._buffer, chunk);
        } else {
            this._buffer = Array.prototype.slice.call(chunk);
        }
    }
    if (hasData && this._inWaiting) {
        this.push(this._buffer[this._index++]); // will trigger read
    }
    if ('function' === typeof cb) {
        cb();
    }
};

ArrayStream.prototype.set = function(chunk) {
    if (this._closing) return false;
    if (!this._buffer) {
        this.performWrite(chunk);
    }
};

ArrayStream.prototype.close = function() {
    var self = this;
    this._closing = true;

    // Wait for previous read to end
    setImmediate(function() {
        self.push(null); // we are done, push null to end stream
    });
}

function noMoreData(stream, n) {
    if (stream._duplex) {
        stream._inWaiting = n;
        stream._reading = false;
    } else {
        setImmediate(function() {
            stream.push(null); // we are done, push null to end stream
        });
    }
}

ArrayStream.prototype._read = function(n) {
    if (this._reading || this._closing) return false;
    var self = this;

    if (!this._buffer) {
        noMoreData(this, n);
        return;
    }

    this._reading = true;
    if (this._index >= this._buffer.length) {
        noMoreData(this, n);
        return;
    }

    this._reading = false;
    
    for (var i = 0; this._index < this._buffer.length && i < n; this._index++, i++) {
        if (!this.push(this._buffer[this._index])) {
            break; // false from push, stop reading
        }
    }

    if (this._duplex) {
        this._inWaiting = 0;
        if (i < n) {
            this._inWaiting += n - i;
        }
    }
};