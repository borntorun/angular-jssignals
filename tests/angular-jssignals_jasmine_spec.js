/*jshint -W098 */
'use strict';
describe('angular-jssignals', function() {
  var signalservice, SignalServiceProvider, $compile, $scope, $log, oInjectedForSpies = {};
  var thesignalskeys = {
    ITEMADDED: 'itemadded',
    ITEMREMOVED: 'itemremoved'
  };
  console.log('JASMINE');
  /**
   * Get the module before each test
   * - configure service provider
   */
  beforeEach(module('SignalServiceModule', function( _SignalServiceProvider_ ) {
    SignalServiceProvider = _SignalServiceProvider_;
    SignalServiceProvider.config(thesignalskeys);
  }));

  /**
   * Inject dependencies before each test
   */
  /*beforeEach(inject(function (_$rootScope_, _$compile_, _$log_) {
      $scope = _$rootScope_.$new();
      $compile = _$compile_;
      oInjectedForSpies.$log = _$log_;
  }));*/

  beforeEach(function() {
    inject(function( _SignalService_ ) {
      signalservice = _SignalService_;

    });
  });

  afterEach(function( done ) {
    done();
  });

  /**
   * Test Suites
   */
  describe('Test service definition and configuration', function() {
    it('service should be defined', function() {
      expect(signalservice).toBeDefined();
    });
    it('on call test() should return "test"', function() {
      expect(signalservice.SIGNALS).toEqual(thesignalskeys);
    });

  });
  describe('Test service functionality', function() {
    var value;

    function callOnItemAdded( data ) {
      value = data.value;
      //expect(data.value).toBe('called');
    }

    beforeEach(function() {
      value = undefined;
      signalservice.listenTo(signalservice.SIGNALS.ITEMADDED, callOnItemAdded);
    });

    afterEach(function() {
      try {
        signalservice.unlistenTo(signalservice.SIGNALS.ITEMADDED, callOnItemAdded);
      } catch( e ) {
      }
    });

    it('should call registered callback on emit event', function( done ) {
      signalservice.emit(signalservice.SIGNALS.ITEMADDED, {value: 'called'});
      setTimeout(function() {
        expect(value).toBe('called');
        done();
      });
    });

    it('should go quietly on listenTo/emit event with invalid key', function( done ) {
      var invalidKey = 'invalid-key-event';
      signalservice.listenTo(invalidKey, callOnItemAdded);
      signalservice.emit(invalidKey, {value: 'called'});
      setTimeout(function() {
        expect(value).not.toBeDefined();
        done();
      });
    });

    it('should not call registered callback on emit event after unlisten', function( done ) {
      signalservice.emit(signalservice.SIGNALS.ITEMADDED, {value: 'called'});
      setTimeout(function() {
        expect(value).toBe('called');
        value = undefined;
        signalservice.unlistenTo(signalservice.SIGNALS.ITEMADDED, callOnItemAdded);
        signalservice.emit(signalservice.SIGNALS.ITEMADDED, {value: 'called'});
        setTimeout(function() {
          expect(value).not.toBeDefined();
          done();
        });

      });
    });

    it('should throw error on emit event after dispose', function( done ) {
      signalservice.emit(signalservice.SIGNALS.ITEMADDED, {value: 'called'});
      setTimeout(function() {
        expect(value).toBe('called');
        value = undefined;
        signalservice.dispose(signalservice.SIGNALS.ITEMADDED);
        try {
          signalservice.emit(signalservice.SIGNALS.ITEMADDED, {value: 'called'});
        } catch( e ) {
          value = 'error';
        }
        setTimeout(function() {
          expect(value).toBe('error');
          done();
        });

      });
    });

  });

  // This is the equivalent of the old waitsFor/runs syntax
  // which was removed from Jasmine 2
  // Credits: https://gist.github.com/abreckner/110e28897d42126a3bb9
  var waitsForAndRuns = function( escapeFunction, runFunction, escapeTime ) {
    if ( escapeFunction() ) {
      runFunction();
      return;
    }
    // check the escapeFunction every millisecond so as soon as it is met we can escape the function
    var interval = setInterval(function() {
      if ( escapeFunction() ) {
        clearMe();
        runFunction();
      }
    }, 1);
    // in case we never reach the escapeFunction, we will time out
    // at the escapeTime
    var timeOut = setTimeout(function() {
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

