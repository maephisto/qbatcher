[![Build Status](https://travis-ci.org/maephisto/qbatcher.svg?branch=master)](https://travis-ci.org/maephisto/qbatcher)

# QBatcher

Batch promises and/or limit them by time intervals.

Suited for issuing request to rate limited APIS (e.g 50 requests/ 10 seconds)

## Installation

``` 
npm install qbatcher
```

## Api

```js
QBatcher.run(array: Collection, i => promise: Iteratee, int: batchSize, int: intervalLimit (milliseconds) )
```
Keep in mind that the interval limit should be milliseconds

The `Promise: Iteratee` will be called for each element in the Collection.

## Use:

```js
var QBatcher = require('qbatcher');

QBatcher.run([ 1, 2, 3, 4, 5], function (payload) {

        return new Promise(function(resolve) {
            setTimeout(function() { resolve(payload * 100) }, 100);
        });

    }, 2, 5000)
    .then(function (results) {
        console.log(results);
    });
```