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
   * jsSignalsServiceModule
   * @module jsSignalsServiceModule
   */
  angular.module('jsSignalsServiceModule', [])
    .constant('Signals', signals)
    .provider('SignalsService', SignalsServiceProvider);

  /**
   * Service provider function for SignalsService
   * @name SignalsServiceProvider
   * @param Signals - signals in js-signals
   */
  /* @ngInject */
  function SignalsServiceProvider( Signals ) {
    /*jshint validthis:true*/
    var EnumSignals = {},
      initSignals = false;

    function SignalsServiceFactory() {
      var _oSignals = {};

      function extendOptions( options ) {
        return angular.extend({
          listenerContext: undefined,
          priority: undefined
        }, options || {});
      }

      /**
       * @typedef listenoptionsHash
       * @type {object}
       * @property {boolean} [addOnce=false] - if true, listen will call <a href="http://millermedeiros.github.io/js-signals/docs/symbols/Signal.html#addOnce">addOnce</a>
       * @property {Object} [listenerContext=undefined]
       * @property {Number} [priority=undefined]
       */

      /**
       * SignalBinding.
       * @external SignalBinding
       * @see {@link http://millermedeiros.github.io/js-signals/docs/symbols/SignalBinding.html}
       */
      /**
       * Signal.
       * @external Signal
       * @see {@link http://millermedeiros.github.io/js-signals/docs/symbols/Signal.html}
       */

      /**
       * Event signal object to manipulate a js-signals Signal
       * @param {string} key named reference to the event signal
       */
      function EventSignal( key ) {
        /**
         * Named key for the signal
         * @type {string}
         */
        this.key = key;
      }

      /**
       * Emit/Dispatch event signal
       * @param {*} [data] Data to emit to listeners
       */
      EventSignal.prototype.emit = function( data ) {
        if ( _oSignals[this.key] ) {
          _oSignals[this.key].dispatch(data);
        }
      };

      /**
       * Add a listener handler to a signal
       * @param {Function} callback listener function bound to the signal
       * @param {listenoptionsHash} options object with options
       * @returns {SignalBinding} <a href="http://millermedeiros.github.io/js-signals/docs/symbols/SignalBinding.html">SignalBinding</a>
       */
      EventSignal.prototype.listen = function( callback, options ) {
        if ( !_oSignals[this.key] ) {
          return undefined;
        }
        options = extendOptions(options);
        options.method = options.addOnce === true ? 'addOnce' : 'add';
        return _oSignals[this.key][options.method](callback, options.listenerContext, options.priority);
      };

      /**
       * Remove a listener from a signal
       * @param {Function} callback listener function bound to the signal
       * @param {listenoptionsHash} options object with options
       * @returns {Function} listener function
       */
      EventSignal.prototype.unlisten = function( callback, options ) {
        if ( !_oSignals[this.key] ) {
          return undefined;
        }
        options = extendOptions(options);
        return _oSignals[this.key].remove(callback, options.listenerContext);
      };

      /**
       * Removes all listeners from a signal
       */
      EventSignal.prototype.unlistenAll = function() {
        if ( !_oSignals[this.key] ) {
          return;
        }
        _oSignals[this.key].removeAll();
      };

      /**
       * Verifies if listener is bound to a signal
       * @param callback {Function} callback listener function bound to the signal
       * @param {listenoptionsHash} options object with options
       * @returns {boolean}
       */
      EventSignal.prototype.isListening = function( callback, options ) {
        if ( !_oSignals[this.key] ) {
          return false;
        }
        options = extendOptions(options);
        return _oSignals[this.key].has(callback, options.listenerContext);
      };

      /**
       * Get number of listeners bound to a signal
       * @returns {Number}
       */
      EventSignal.prototype.getNumListeners = function() {
        if ( !_oSignals[this.key] ) {
          return 0;
        }
        return _oSignals[this.key].getNumListeners();
      };

      /**
       * Destroys the event signal
       */
      EventSignal.prototype.dispose = function() {
        if ( !_oSignals[this.key] ) {
          return;
        }
        _oSignals[this.key].dispose();
        delete _oSignals[this.key];
      };

      /**
       * Forget memorized arguments.
       * @see http://millermedeiros.github.io/js-signals/docs/symbols/Signal.html#forget
       */
      EventSignal.prototype.forget = function() {
        if ( !_oSignals[this.key] ) {
          return;
        }
        _oSignals[this.key].forget();
      };

      /**
       * Get the Signal object
       * @returns {Signal} <a href="http://millermedeiros.github.io/js-signals/docs/symbols/Signal.html">Signal</a>
       */
      EventSignal.prototype.get = function() {
        if ( !_oSignals[this.key] ) {
          return undefined;
        }
        return _oSignals[this.key];
      };

      //-------------------------------------------

      /**
       * Signals Service object <br/>The service expose methods to manipulate each event signal - named by a key.
       * <br/>At runtime is created a property of type {@link EventSignal} for each registered signal
       * <br/>that is accessed by this[key]
       * @name SignalsService
       */
      function SignalsService() {
        Object.defineProperty(this, 'SIGNALS', {enumerable: true, configurable: false, writable: false,
          value: EnumSignals
        });

        this.register = function( key ) {
          return register.call(this, key);
        };
        this.emit = function( key, data ) {
          if ( register.call(this, key) ) {
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
      var theService = new SignalsService();

      //initialize signals at creation if configured to do that
      if ( initSignals ) {
        for ( var k in EnumSignals ) {
          if ( EnumSignals.hasOwnProperty(k) && typeof EnumSignals[k] === 'string' ) {
            theService.register(EnumSignals[k]);
          }
        }
      }
      return theService;

      //-------------------------------------------

      /**
       * Validates if a key is allowed to be registered
       * @param key
       * @returns {boolean}
       */
      function isValidSignal( key ) {
        //TODO: ? by now only the service need to be configured with all event keys; maybe this shoul be modified to allow dynamicly registration...
        for ( var k in EnumSignals ) {
          if ( EnumSignals.hasOwnProperty(k) && typeof key === 'string' && EnumSignals[k] === key ) {
            return true;
          }
        }
        return false;
      }

      /**
       * Internal function to register an Event Signal
       * @param key
       * @returns {boolean}
       */
      function register( key ) {

        if ( !isValidSignal(key) ) {
          return false;
        }

        if ( _oSignals[key] ) {
          return true;
        }

        if ( !_oSignals[key] ) {
          //create the js-signals event signal
          _oSignals[key] = new Signals();
        }

        //don't know if this is necessary...
        //var signalServiceInstance = this;

        //signal object will be defined only once per signal key
        if ( this[key] ) {
          return true;
        }

        //create property with signal name (key) for EventSignal object
        Object.defineProperty(this, key, {value: new EventSignal(key), enumerable: true, configurable: false, writable: false});

        //protect event signal properties
        for ( var prop in this[key] ) {
          Object.defineProperty(this[key], prop, {enumerable: true, configurable: false, writable: false, value: this[key][prop]});
        }

        return true;
      }

      /*don't need to have unregister...
      property will need to be configurable and it would allow deletion causing trouble or
      need for extra code to validate operations
      logic is: a valid entry signal will have a property key to an object with handler methods for signal (emit, listen, etc.... )
      this logic is different from signals logic itself
      The dispose method will destroy the js-signal object
      function unregister( key ) {
        delete this[key];
      }*/

    }

    /**
     * @typedef configOptionsHash
     * @type {object}
     * @property {boolean} [init=false] - if true, the event signals will be initialized when service is instanciated. If false on first use.
     * @property {Object} [signals={}]
     */

    /**
     * Configuration for service
     * @param {configOptionsHash} config
     */
    this.config = function( config ) {
      if ( config ) {
        angular.extend(EnumSignals, config.signals || {});
        initSignals = config.init || initSignals;
      }
    };

    this.$get = function() {
      return new SignalsServiceFactory();
    };
  }
  SignalsServiceProvider.$inject = ["Signals"];
});
