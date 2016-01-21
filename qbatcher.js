'use strict';

var Q = require('q');

var QBatcher = {

    /**
     * Will batch the promise fullfiling on size/time interval
     * @param payloadsArray
     * @param promiseFactory
     * @param batchSize
     * @param batchInterval
     * @returns {*|promise}
     */
    run: function (payloadsArray, promiseFactory, batchSize, batchInterval) {
        var deferred = Q.defer();
        var aggregatedResults = [];
        var batchStartTime = null;

        /**
         * Will select a set of payloads and build pro corresponding promises out of them
         */
        function executeBatch () {
            try {
                batchStartTime = (new Date()).getTime();

                var currentPayloadsBatch = payloadsArray.splice(0, batchSize);

                if (currentPayloadsBatch.length > 0) {
                    //process the batch
                    var promisesBatch = currentPayloadsBatch.map(promiseFactory);
                    Q.allSettled(promisesBatch)
                        .then(function (results) {
                            aggregatedResults = aggregatedResults.concat(results);

                            attemptExecution(executeBatch);
                        })
                        .catch(function(reason) {
                            /**
                             * The failed batch wil be added to results with the failure reason
                             */
                            currentPayloadsBatch.forEach(function (payload) {
                                aggregatedResults.push({ payload: payload, reason: reason, success: false });
                            });

                            attemptExecution(executeBatch);
                        });

                } else {
                    /**
                     * Prepare the result
                     * @type {Array}
                     */
                    aggregatedResults = aggregatedResults.map(function(result) {
                        return (result && result.value) ? result.value : result.reason;
                    });
                    deferred.resolve(aggregatedResults);
                }

            } catch (error) {
                console.log('ERROR: ', error.toString());
            }

        }

        /**
         * Only execute callback if the time interval has passed
         * otherwise just wait
         * @param callback
         */
        var attemptExecution = function (callback) {
            var spentTime = (new Date()).getTime() - batchStartTime;

            if (batchInterval && spentTime < batchInterval) {
                setTimeout(function() {
                    callback();
                    batchStartTime = (new Date()).getTime();
                }, batchInterval - spentTime);
            } else {
                callback();
            }
        };

        executeBatch(payloadsArray, promiseFactory, batchSize);

        return deferred.promise;
    }
};

module.exports = QBatcher;
