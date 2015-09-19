sm-array-stream
=======
Create a stream from an array

```javascript
var ArrayStream = require('array-stream');
var arr = [1, 2, 3],
    stream = new ArrayStream(arr),
    index = 0;

stream.on('data', function(chunk) {
    console.log(chunk, arr[index++]);
});

stream.once('end', function() {
    console.log(index, 3);
});
```

```javascript
var arr = [1, 2, 3],
    add = [4, 5, 6],
    stream = new ArrayStream(arr, {
        duplex: true
    }),
    index = 0;

stream.on('data', function(chunk) {
    console.log(chunk, arr[index++]);
    if (index === 3) {
        arr.push.apply(arr, add);
        stream.write(add, function() {
            stream.once('data', function(chunk) {
                console.log(index, 4);
            });
            stream.end();
        });
    }
});

stream.once('end', function() {
    console.log(index, arr.length);
});
```

## Class: ArrayStream


### ArrayStream.end() 

End stream


### ArrayStream.set(arr) 

Set array to stream

**Parameters**

**arr**: `Array`, Array to stream

* * *

License
-------
The MIT License (MIT)

Copyright (c) 2014-2015 Stéphane MBAPE

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
