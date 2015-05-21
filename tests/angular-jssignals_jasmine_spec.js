/*jshint -W098 */
'use strict';
describe('angular-jssignals', function () {
    var $compile, $scope, $log, oInjectedForSpies = {};
    console.log('JASMINE');
    /**
     * Get the directive module before each test
     */
    beforeEach(module('angularjsSignalsServiceModule'));
    /**
     * Inject dependencies before each test
     */
    beforeEach(/*inject(function (_$rootScope_, _$compile_, _$log_) {
        $scope = _$rootScope_.$new();
        $compile = _$compile_;
        oInjectedForSpies.$log = _$log_;
    })*/);


    /**
     * Test Suites
     */
    describe('...', function () {
        it('...', function() {

        });
    });


    // This is the equivalent of the old waitsFor/runs syntax
    // which was removed from Jasmine 2
    // Credits: https://gist.github.com/abreckner/110e28897d42126a3bb9
    var waitsForAndRuns = function (escapeFunction, runFunction, escapeTime) {
        if (escapeFunction()) {
            runFunction();
            return;
        }
        // check the escapeFunction every millisecond so as soon as it is met we can escape the function
        var interval = setInterval(function () {
            if (escapeFunction()) {
                clearMe();
                runFunction();
            }
        }, 1);
        // in case we never reach the escapeFunction, we will time out
        // at the escapeTime
        var timeOut = setTimeout(function () {
            clearMe();
            runFunction();
        }, escapeTime);
        // clear the interval and the timeout
        function clearMe() {
            clearInterval(interval);
            clearTimeout(timeOut);
        }
    };
});

