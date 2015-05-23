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
   * @param Signals
   * @constructor
   */
  /* @ngInject */
  function SignalServiceProvider( Signals ) {
    var EnumSignals = {};

    function SignalServiceFactory() {
      /*jshint validthis:true*/
      var _arraySignals;

      _arraySignals = {};

      var signalInterface = {
        emit: dispatch,
        listen: add,
        unlisten: remove,
        unlistenAll: removeAll,
        isListening: has,
        getNumListeners: getNumListeners,
        forget: forget,
        get: get,
        dispose: dispose
      };

      function SignalService() {
        Object.defineProperty(this, 'SIGNALS', {enumerable: true, configurable:false, writable: false,
          value: EnumSignals
        });

        this.register = function( key ) {
          return register.call(this, key);
        };
        this.emit = function( key, data ) {
          register.call(this, key) && (this[key].emit(data));
        };
        this.listen = function( key, callback, options ) {
          if ( register.call(this, key) ) {
            return this[key].listen(callback, options);
          }
        };
        this.unlisten = function( key, callback, options ) {
          return this[key].unlisten(callback, options);
        };
        this.unlistenAll = function( key ) {
          return this[key].unlistenAll();
        };
        this.isListening = function( key, callback, options ) {
          return this[key].isListening(callback, options);
        };
        this.getNumListeners = function( key ) {
          return this[key]? this[key].getNumListeners() : 0;
        };
        this.dispose = function( key ) {
          this[key].dispose();
        };
        this.forget = function( key ) {
          this[key].forget();
        };
        this.get = function( key ) {
          return this[key].get();
        };
      }

      return new SignalService();

      /**
       * @name register
       * @param key
       * @returns {boolean}
       */
      function register( key ) {

        if ( !isValidSignal(key) ) {
          return false;
        }

        if ( _arraySignals[key] ) {
          return true;
        }

        if (!_arraySignals[key]) {
          _arraySignals[key] = new Signals();
        }

        //don't know if this is necessary...
        //var signalServiceInstance = this;

        //interface methods for signal key already defined
        if (this[key]) {
          return true;
        }

        //interface methods will be defined only once per signal key
        Object.defineProperty(this, key, {value: (function() {
          //extend object interface
          var oSignal = angular.extend({key: key}, signalInterface);
          //modify properties of new object
          for (var prop in oSignal) {
            Object.defineProperty(oSignal, prop, {enumerable: true, configurable:false, writable: false, value: oSignal[prop]});
          }
          return oSignal;
        }())});

        return true;
      }

      /*don't need to have unregister...
      property will need to be configurable and it would allow deletion causing trouble or
      need for extra code to validate operations
      logic is: a valid entry signal will have a property key to an object with handler methods for signal (emit, listen, etc.... )
      this logic is different from signals logic itself
      The dispose method will destroy the signal object
      function unregister( key ) {
        delete this[key];
      }*/

      function dispatch( data ) {
        _arraySignals[this.key].dispatch(data);
      }

      function add( callback, options ) {
        options = extendOptions(options);
        options.method = options.addOnce === true ? 'addOnce' : 'add';
        return _arraySignals[this.key][options.method](callback, options.listenerContext, options.priority);
      }

      function remove( callback, options ) {
        options = extendOptions(options);
        return _arraySignals[this.key].remove(callback, options.listenerContext);
      }

      function removeAll() {
        return _arraySignals[this.key].removeAll();
      }

      function has( callback, options ) {
        options = extendOptions(options);
        return _arraySignals[this.key].has(callback, options.listenerContext);
      }

      function getNumListeners() {
        return _arraySignals[this.key].getNumListeners();
      }

      function forget() {
        return _arraySignals[this.key].forget();
      }

      function get() {
        return _arraySignals[this.key];
      }

      function dispose() {
        _arraySignals[this.key].dispose();
        delete _arraySignals[this.key];
      }





      /**
       * Util functions
       *
       */

      /**
       *
       * @param options
       * @returns {Object}
       */
      function extendOptions( options ) {
        return angular.extend({
          listenerContext: undefined,
          priority: undefined
        }, options || {});
      }

      /**
       *
       * @param key
       * @returns {boolean}
       */
      function isValidSignal( key ) {
        for ( var k in EnumSignals ) {
          if ( EnumSignals.hasOwnProperty(k) && EnumSignals[k] === key ) {
            return true;
          }
        }
        return false;
      }
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
      return new SignalServiceFactory();
    };
  }
});
