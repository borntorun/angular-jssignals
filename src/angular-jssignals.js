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

  /**
   * Signal Service Module
   * @name SignalServiceModule
   * @author João Carvalho
   */
  angular.module('SignalServiceModule', [])
    .constant('Signals', signals)
    .provider('SignalService', SignalServiceProvider);

  /**
   * Service provider for Signal Service
   * @name SignalServiceProvider
   */
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

      function extendOptions( options ) {
        return angular.extend({
          listenerContext: undefined,
          priority: undefined
        }, options || {});
      }

      function Instance() {
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
        this.emit = function( key, data ) {
          register(key) && (signalsObject[key].dispatch(data));
        };
        this.listen = function( key, callback, options ) {
          if (register(key)){
            options = extendOptions(options);
            options.method = options.addOnce === true? 'addOnce': 'add';
            return signalsObject[key][options.method](callback, options.listenerContext, options.priority);
          }
        };
        this.unlisten = function( key, callback, options ) {
          options = extendOptions(options);
          if (signalsObject[key]) {
            return signalsObject[key].remove(callback, options.listenerContext);
          }
        };
        this.unlistenAll = function( key ) {
          if (signalsObject[key]) {
            return signalsObject[key].removeAll();
          }
        };
        this.isListening = function( key, callback, options ) {
          if (signalsObject[key]) {
            options = extendOptions(options);
            return signalsObject[key].has(callback, options.listenerContext);
          }
        };
        this.getNumListeners = function(key) {
          return signalsObject[key]? signalsObject[key].getNumListeners() : 0;
        };
        this.dispose = function( key ) {
          if (signalsObject[key]) {
            signalsObject[key].dispose();
            delete signalsObject[key];
          }
        };
        this.forget = function( key ) {
          if (signalsObject[key]) {
            signalsObject[key].forget();
          }
        };
        this.getSignal = function( key ) {
          return signalsObject[key];
        };
      }

      return new Instance();
    }

    /**
     * Permits configuration for the service instance
     * @name config
     * @param {object} config Identification ids for permitted signals
     */
    this.config = function( config ) {
      angular.extend(EnumSignals, config);
    };

    this.$get = function() {
      return new SignalService();
    };
  }
});
