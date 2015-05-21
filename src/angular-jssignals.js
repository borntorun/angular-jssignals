/*jshint -W098 */
(function( global, factory ) {
  'use strict';
  if ( typeof define === 'function' && define.amd ) {
    define(['signals'], function( signals ) {
      factory(global.angular, signals);
    });
  }
  else if ( typeof exports === 'object' ) {
    var angular = global.angular || (window && window.angular);
    module.exports = factory(angular, require('signals'));
  }
  else {
    factory(global.angular, global.signals);
  }
})(this, function( angular, signals ) {
  'use strict';

  angular.module('SignalServiceModule', [])
    .constant('Signals', signals)
    .provider('SignalService', SignalServiceProvider);

  /* @ngInject */
  function SignalServiceProvider( Signals ) {
    var EnumSignals = {};

    function SignalService() {
      var signalsObject;

      signalsObject = {};

      function isValidSignal( key ) {
        for ( var k in EnumSignals ) {
          if ( EnumSignals.hasOwnProperty(k) && EnumSignals[k] === key ) {
            return true;
          }
        }
        return false;
      }

      function register( key ) {
        if ( !isValidSignal(key) ) {
          return false;
        }
        !signalsObject[key] && (signalsObject[key] = new Signals());
        return true;
      }

      function Signal() {
        Object.defineProperty(this, 'SIGNALS', {
          value: EnumSignals
        });
        /*this.register = function( key ) {
          if ( !isValidSignal(key) ) {
            return;
          }
          !signalsObject[key] && (signalsObject[key] = new signals());

        };
        this.unregister = function( key ) {
          signalsObject[key] && (delete signalsObject[key]);
        };*/
        this.listenTo = function( key, callback ) {
          register(key) && (signalsObject[key].add(callback));
        };
        this.unlistenTo = function( key, callback ) {
          signalsObject[key] && (signalsObject[key].remove(callback));
        };
        this.emit = function( key, data ) {
          register(key) && (signalsObject[key].dispatch(data));
        };
        this.dispose = function( key ) {
          signalsObject[key] && (signalsObject[key].dispose() && delete signalsObject[key]);
        };
      }

      return new Signal();
    }

    this.config = function( config ) {
      angular.extend(EnumSignals, config);
    };

    this.$get = function() {
      return new SignalService();
    };
  }
});
