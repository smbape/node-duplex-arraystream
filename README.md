sm-array-stream
=======
Create a stream from an array

```javascript
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
`LICENCE`