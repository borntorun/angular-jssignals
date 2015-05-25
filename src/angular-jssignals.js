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
   * @param Signals - signals in js-signals
   */
  /* @ngInject */
  function SignalServiceProvider( Signals ) {
    var EnumSignals = {},
      initSignals = false;

    function SignalServiceFactory() {
      /*jshint validthis:true*/
      var _oSignals;

      _oSignals = {};

      //interface for the Signal propeyty object
      /*var signalInterface = {
        emit: dispatch,
        listen: add,
        unlisten: remove,
        unlistenAll: removeAll,
        isListening: has,
        getNumListeners: getNumListeners,
        dispose: dispose,
        forget: forget,
        get: get
      };*/


      function Signal(key) {
        this.key = key;
      }

      Signal.prototype.emit =  function ( data ) {
        if ( _oSignals[this.key] ) {
          _oSignals[this.key].dispatch(data);
        }
      };

      Signal.prototype.listen = function ( callback, options ) {
        if ( !_oSignals[this.key] ) {
          return undefined;
        }
        options = extendOptions(options);
        options.method = options.addOnce === true ? 'addOnce' : 'add';
        return _oSignals[this.key][options.method](callback, options.listenerContext, options.priority);
      };

      Signal.prototype.unlisten = function ( callback, options ) {
        if ( !_oSignals[this.key] ) {
          return undefined;
        }
        options = extendOptions(options);
        return _oSignals[this.key].remove(callback, options.listenerContext);
      };

      Signal.prototype.unlistenAll = function () {
        if ( !_oSignals[this.key] ) {
          return;
        }
        _oSignals[this.key].removeAll();
      };

      Signal.prototype.isListening = function ( callback, options ) {
        if ( !_oSignals[this.key] ) {
          return false;
        }
        options = extendOptions(options);
        return _oSignals[this.key].has(callback, options.listenerContext);
      };

      Signal.prototype.getNumListeners = function () {
        if ( !_oSignals[this.key] ) {
          return 0;
        }
        return _oSignals[this.key].getNumListeners();
      };

      Signal.prototype.dispose = function () {
        if ( !_oSignals[this.key] ) {
          return;
        }
        _oSignals[this.key].dispose();
        delete _oSignals[this.key];
      };

      Signal.prototype.forget = function () {
        if ( !_oSignals[this.key] ) {
          return;
        }
        _oSignals[this.key].forget();
      };

      Signal.prototype.get = function () {
        if ( !_oSignals[this.key] ) {
          return undefined;
        }
        return _oSignals[this.key];
      };



      /**
       * Signal service object
       * The service expose methods to manipulate each signal - named by a key
       * At runtime is created a property of type Signal for each registered signal.
       * If a signal with key='itemadded' is registered then
       * if ***signalservice*** is the reference to the instanec service then
       * ***signalservice.itemadded*** will be a reference to the Signal object to manipulate the signal
       *
       * A signal can be manipulated by two ways:
       * signalservice.itemadded.emit(...)
       * or
       * signalservice.emit('itemadded', ...)
       * @name SignalService
       * @constructor
       */
      function SignalService() {
        Object.defineProperty(this, 'SIGNALS', {enumerable: true, configurable: false, writable: false,
          value: EnumSignals
        });

        this.register = function( key ) {
          return register.call(this, key);
        };
        this.emit = function( key, data ) {
          if (register.call(this, key)){
            this[key].emit(data);
          }
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
          return this[key] ? this[key].getNumListeners() : 0;
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

      //create instance of service
      var theService = new SignalService();

      //initialize signals at creation if configured to do that
      if ( initSignals ) {
        for ( var k in EnumSignals ) {
          if ( EnumSignals.hasOwnProperty(k) && typeof EnumSignals[k] === 'string' ) {
            theService.register(EnumSignals[k]);
          }
        }
      }
      return theService;

      /**
       * @name register
       * - Register a signal
       * @param key the named key for the signal
       * @returns {boolean} true if signal was registered successful
       */
      function register( key ) {

        if ( !isValidSignal(key) ) {
          return false;
        }

        if ( _oSignals[key] ) {
          return true;
        }

        if ( !_oSignals[key] ) {
          _oSignals[key] = new Signals();
        }

        //don't know if this is necessary...
        //var signalServiceInstance = this;

        //interface methods for signal key already defined
        //interface methods will be defined only once per signal key
        if ( this[key] ) {
          return true;
        }

        //aux function to create object
        //from: http://javascript.crockford.com/prototypal.html
        //also here: http://www.martinrinehart.com/frontend-engineering/engineers/javascript/inher/masters/master-inher-crockford.html
        /*var oCreate = function( key, o ) {
          function Signal() {
            this.key = key;
          }
          Signal.prototype = o
          return new Signal();
        }*/
        //create property with signal name (key) with 'signalInterface' as its prototype
        //Object.defineProperty(this, key, {value: oCreate(key, signalInterface), enumerable: true, configurable: false, writable: false});
        Object.defineProperty(this, key, {value: new Signal(key), enumerable: true, configurable: false, writable: false});

        for ( var prop in this[key] ) {
          Object.defineProperty(this[key], prop, {enumerable: true, configurable: false, writable: false, value: this[key][prop]});
        }

        /*//interface methods will be defined only once per signal key
        Object.defineProperty(this, key, {value: (function() {
          //extend object interface
          var oSignal = angular.extend({key: key}, signalInterface);
          //modify properties of new object
          for ( var prop in oSignal ) {
            Object.defineProperty(oSignal, prop, {enumerable: true, configurable: false, writable: false, value: oSignal[prop]});
          }
          return oSignal;
        }())});*/

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
          if ( EnumSignals.hasOwnProperty(k) && typeof key === 'string' && EnumSignals[k] === key ) {
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
      angular.extend(EnumSignals, config.signals || {});
      initSignals = config.init || initSignals;
    };

    this.$get = function() {
      return new SignalServiceFactory();
    };
  }
});
