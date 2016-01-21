'use strict';

var QBatcher = require ('../index'),
    chai = require('chai'),
    Q = require('q'),
    expect = chai.expect;

describe('QBatcher specification:', function () {

    before(function (done) {
        done();
    });

    it('should return an array of results', function (done) {
        this.timeout(1000000);

        QBatcher.run([ 1, 2, 3, 4, 5], function (payload) {
                var deferred = Q.defer();

                setTimeout(function() { deferred.resolve(payload * 100) }, 100);

                return deferred.promise;
            }, 2)
        .then(function (results) {
            expect(results).to.eql([ 100, 200, 300, 400, 500]);
            done();
        });
    });

    it('should batch promises', function (done) {
        this.timeout(1000000);

        var maxConcurrent = 0;
        var currentBatchSize = 0;

        QBatcher.run([ 1, 2, 3, 4, 5], function (payload) {
                var deferred = Q.defer();

                setTimeout(function() {
                    currentBatchSize ++;
                    if (currentBatchSize > maxConcurrent) {
                        maxConcurrent = currentBatchSize
                    }

                    deferred.resolve(payload * 100);
                }, 100);

                setTimeout(function() {
                    currentBatchSize = 0;
                }, 110);

                return deferred.promise;
            }, 2)
            .then(function () {
                expect(maxConcurrent).to.eql(2);
                done();
            });
    });

    it('should return rejection reason for a rejected promise, along with the successful results', function (done) {
        this.timeout(1000000);

        QBatcher.run([ 1, 2, 3, 4, 5], function (payload) {
                var deferred = Q.defer();

                setTimeout(function() {
                    if (payload === 3) {
                        deferred.reject('reason');
                    } else {
                        deferred.resolve(payload * 100);
                    }

                }, 100);

                return deferred.promise;
            }, 2)
            .then(function (results) {
                expect(results).to.eql([ 100, 200, 'reason', 400, 500]);
                done();
            });
    });

    it('should execute one batch per time interval', function (done) {
        this.timeout(1000000);

        var maxConcurrent = 0;
        var currentBatchSize = 0;

        QBatcher.run([ 1, 2, 3, 4, 5], function (payload) {
                var deferred = Q.defer();

                setTimeout(function() {
                    currentBatchSize ++;
                    if (currentBatchSize > maxConcurrent) {
                        maxConcurrent = currentBatchSize
                    }

                    deferred.resolve(payload * 100);
                }, 50);

                setTimeout(function() {
                    currentBatchSize = 0;
                }, 160);

                return deferred.promise;
            }, 2, 150)
            .then(function () {
                expect(maxConcurrent).to.equal(2);
                done();
            });
    });

    it('should return an array of results, when used with native ES6 Promises', function (done) {
        this.timeout(1000000);

        QBatcher.run([ 1, 2, 3, 4, 5], function (payload) {

                return new Promise(function(resolve) {
                    setTimeout(function() { resolve(payload * 100) }, 100);
                });

            }, 2)
            .then(function (results) {
                expect(results).to.eql([ 100, 200, 300, 400, 500]);
                done();
            });
    });

});
