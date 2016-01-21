# QBatcher

Batch promises and/or limit them by time intervals.
Suited for issueing request to rate limited APIS

## Installation

``` 
npm install qbatcher
```

## Api

```js
QBatcher.run(array: Collection, i => Q.promise: Iteratee, int: batchSize, int: intervalLimit (milliseconds) )
```

The `Promise: Iteratee` will be called after each batch.

## Use:

```js
var QBatcher = require('qbatcher');

QBatcher.run([ 1, 2, 3, 4, 5], function (payload) {

        return new Promise(function(resolve) {
            setTimeout(function() { resolve(payload * 100) }, 100);
        });

    }, 2)
    .then(function (results) {
        console.log(results);
    });
```