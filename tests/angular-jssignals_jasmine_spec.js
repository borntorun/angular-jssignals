/*jshint -W098 */
'use strict';

describe('angular-jssignals:', function() {
  var signalsService, SignalsServiceProvider;
  var config = [
    {init: true, signals: {ITEMADDED: 'itemadded', ITEMREMOVED: 'itemremoved'}},
    {init: true, signals: {}},
    {init: true},
    {},
    {signals: {}},
    {signals: {ITEMADDED: 'itemadded', ITEMREMOVED: 'itemremoved'}},
    {init: false, signals: {ITEMADDED: 'itemadded', ITEMREMOVED: 'itemremoved'}},
    {init: false, signals: {}},
    {init: false}
  ];

  config.forEach(function( item, index ) {
    describe('Test provider configuration - [config=' + index + '] ==> ', function() {

      beforeEach(module('jsSignalsServiceModule', function( _SignalsServiceProvider_ ) {
        SignalsServiceProvider = _SignalsServiceProvider_;
        (item.signals || item.init) && (SignalsServiceProvider.config(item));
      }));

      beforeEach(function() {
        inject(function( _SignalsService_ ) {
          signalsService = _SignalsService_;
        });
      });

      it('service should be defined', function() {
        expect(signalsService).toBeDefined();
      });

      it('should have provider configured', function() {
        expect(signalsService.SIGNALS).toEqual(item.signals || {});
        for ( var k in signalsService.SIGNALS ) {
          expect((signalsService[signalsService.SIGNALS[k]] ? true : false) === (item.init || false)).toBeTruthy();
        }
      });
    });

  });

});

describe('angular-jssignals:', function() {
  var signalsService, SignalsServiceProvider;
  var config = {
    signals: {
      ITEMADDED: 'itemadded',
      ITEMREMOVED: 'itemremoved'
    }
  };

  /**
   * Get the module before each test
   * - configure service provider
   */
  beforeEach(module('jsSignalsServiceModule', function( _SignalsServiceProvider_ ) {
    SignalsServiceProvider = _SignalsServiceProvider_;
    SignalsServiceProvider.config(config);
  }));

  beforeEach(function() {
    inject(function( _SignalsService_ ) {
      signalsService = _SignalsService_;
    });
  });

  describe('Test service functionality ("method invocation") ==> ', function() {
    var value;

    function callOnItemAdded( data ) {
      value = data.value;
    }

    function callOnItemRemoved( data ) {
      value = data.value;
      //expect(data.value).toBe('called');
    }

    beforeEach(function() {
      value = undefined;
    });

    afterEach(function() {
      try {
        signalsService.unlisten(signalsService.SIGNALS.ITEMADDED, callOnItemAdded);
        signalsService.unlisten(signalsService.SIGNALS.ITEMREMOVED, callOnItemRemoved);
      } catch( e ) {
      }
    });

    it('should call registered callback on emit event', function( done ) {
      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnItemAdded);
      signalsService.emit(signalsService.SIGNALS.ITEMADDED, {value: 'called'});

      setTimeout(function() {
        expect(value).toBe('called');
        done();
      });
    });

    it('should evaluate if listeners are registered', function() {
      function IamNotListening() {
      }

      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnItemAdded);
      expect(signalsService.isListening(signalsService.SIGNALS.ITEMADDED, callOnItemAdded)).toBeTruthy();
      expect(signalsService.isListening(signalsService.SIGNALS.ITEMADDED, IamNotListening)).toBeFalsy();
    });

    it('should evaluate number of listeners that are registered', function() {
      function IamListening() {
      }

      expect(signalsService.getNumListeners(signalsService.SIGNALS.ITEMADDED)).toBe(0);
      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnItemAdded);
      expect(signalsService.getNumListeners(signalsService.SIGNALS.ITEMADDED)).toBe(1);
      signalsService.listen(signalsService.SIGNALS.ITEMADDED, IamListening);
      expect(signalsService.getNumListeners(signalsService.SIGNALS.ITEMADDED)).toBe(2);
    });

    it('should call registered callback on emit event more than once', function( done ) {
      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnItemAdded);
      signalsService.emit(signalsService.SIGNALS.ITEMADDED, {value: 'called'});

      setTimeout(function() {
        expect(value).toBe('called');
        value = undefined;
        signalsService.emit(signalsService.SIGNALS.ITEMADDED, {value: 'called'});
        setTimeout(function() {
          expect(value).toBe('called');
          done();
        });
      });
    });

    it('should go quietly on listen/emit event with invalid key', function( done ) {
      var invalidKey = 'invalid-key-event';
      signalsService.listen(invalidKey, callOnItemAdded);
      signalsService.emit(invalidKey, {value: 'called'});

      setTimeout(function() {
        expect(value).not.toBeDefined();
        done();
      });
    });

    it('should not call registered callback on emit event after unlisten', function( done ) {
      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnItemAdded);
      signalsService.emit(signalsService.SIGNALS.ITEMADDED, {value: 'called'});

      setTimeout(function() {
        expect(value).toBe('called');
        value = undefined;
        signalsService.unlisten(signalsService.SIGNALS.ITEMADDED, callOnItemAdded);
        signalsService.emit(signalsService.SIGNALS.ITEMADDED, {value: 'called'});

        setTimeout(function() {
          expect(value).not.toBeDefined();
          done();
        });

      });
    });

    it('should clear things on dispose', function( done ) {

      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnItemAdded);
      var theSignal1 = signalsService.get(signalsService.SIGNALS.ITEMADDED);
      //console.log(theSignal1);

      signalsService.emit(signalsService.SIGNALS.ITEMADDED, {value: 'called'});

      setTimeout(function() {
        expect(value).toBe('called');
        value = undefined;

        signalsService.dispose(signalsService.SIGNALS.ITEMADDED);

        signalsService.emit(signalsService.SIGNALS.ITEMADDED, {value: 'called'});
        var theSignal2 = signalsService.get(signalsService.SIGNALS.ITEMADDED);

        setTimeout(function() {
          //since dispose clear listeners the listener should not be called even if the signal is recreated on the second emit
          //and signals should be different
          expect(value).not.toBeDefined();
          expect(theSignal1).not.toEqual(theSignal2);
          done();
        });

      });
    });

    it('should call registered callback only once on emit event', function( done ) {
      var value = 0;

      function callOnItemAdded() {
        value++;
      }

      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnItemAdded, {addOnce: true});
      signalsService.emit(signalsService.SIGNALS.ITEMADDED, {});
      setTimeout(function() {
        expect(value).toBe(1);
        signalsService.emit(signalsService.SIGNALS.ITEMADDED, {});
        setTimeout(function() {
          expect(value).toBe(1);
          done();
        });
      });
    });

    it('should call registered callback by order on emit event', function( done ) {
      var value = 1;

      function callOnEventAdd3() {
        value += 3;
      }

      function callOnEventDivideBy2() {
        value = value / 2;
      }

      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnEventAdd3);
      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnEventDivideBy2);
      signalsService.emit(signalsService.SIGNALS.ITEMADDED, {});

      setTimeout(function() {
        expect(value).toBe(2);
        done();
      });
    });

    it('should call registered callback by priority on emit event', function( done ) {
      var value = 1;

      function callOnEventAdd3() {
        value += 3;
      }

      function callOnEventDivideBy2() {
        value = value / 2;
      }

      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnEventAdd3);
      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnEventDivideBy2, {priority: 1});
      signalsService.emit(signalsService.SIGNALS.ITEMADDED, {});

      setTimeout(function() {
        expect(value).toBe(3.5);
        done();
      });
    });

    it('should call registered callback on emit event with context', function( done ) {
      /*jshint validthis:true*/
      function callOnItemAdded() {
        value = this;
      }

      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnItemAdded, {listenerContext: {me: true}});
      signalsService.emit(signalsService.SIGNALS.ITEMADDED, {value: 'called'});

      setTimeout(function() {
        expect(value).toBeDefined();
        expect(value.me).toBeTruthy();
        done();
      });
    });

    it('should allow for curry arguments', function( done ) {
      /*jshint validthis:true*/
      function callOnItemAdded( from, name ) {
        value = from + name;
      }

      var signalbinding = signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnItemAdded);
      signalbinding.params = [ 'From John: ' ];
      signalsService.emit(signalsService.SIGNALS.ITEMADDED, 'Hi!');

      setTimeout(function() {
        expect(value).toBe('From John: Hi!');
        done();
      });
    });

    it('should allow for remove correct listener/context', function( done ) {
      var value = 0;
      /*jshint validthis:true*/
      function callOnItemAdded() {
        value += this.me;
      }

      //each context add its me property to value variable
      var context1 = {me: 1}, context2 = {me: 2}, context3 = {me: 3}, context4 = {me: -10};
      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnItemAdded, {listenerContext: context1});
      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnItemAdded, {listenerContext: context2});
      signalsService.emit(signalsService.SIGNALS.ITEMADDED, {});

      setTimeout(function() {
        expect(value).toBe(3);
        signalsService.unlisten(signalsService.SIGNALS.ITEMADDED, callOnItemAdded, {listenerContext: context1});
        signalsService.emit(signalsService.SIGNALS.ITEMADDED, {});

        setTimeout(function() {
          expect(value).toBe(5);
          signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnItemAdded, {listenerContext: context3});
          signalsService.emit(signalsService.SIGNALS.ITEMADDED, {});

          setTimeout(function() {
            expect(value).toBe(10);
            signalsService.unlisten(signalsService.SIGNALS.ITEMADDED, callOnItemAdded, {listenerContext: context2});
            signalsService.unlisten(signalsService.SIGNALS.ITEMADDED, callOnItemAdded, {listenerContext: context3});
            signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnItemAdded, {listenerContext: context4});
            signalsService.emit(signalsService.SIGNALS.ITEMADDED, {});

            setTimeout(function() {
              expect(value).toBe(0);
              done();
            });
          });
        });
      });
    });

    it('should remove all listeners', function( done ) {
      var value = 0;
      /*jshint validthis:true*/
      function callOnItemAdded1() {
        value++;
      }

      function callOnItemAdded2() {
        value++;
      }

      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnItemAdded1);
      signalsService.listen(signalsService.SIGNALS.ITEMADDED, callOnItemAdded2);
      signalsService.emit(signalsService.SIGNALS.ITEMADDED, {});

      setTimeout(function() {
        expect(value).toBe(2);
        value = 0;
        signalsService.unlistenAll(signalsService.SIGNALS.ITEMADDED);
        signalsService.emit(signalsService.SIGNALS.ITEMADDED, {});

        setTimeout(function() {
          expect(value).toBe(0);
          done();
        });
      });
    });

    it('should memorize params emited and forget should work', function( done ) {
      var value = 0;
      /*jshint validthis:true*/

      signalsService.listen(signalsService.SIGNALS.ITEMADDED, function( v ) {
        value += v;
      });

      var signal = signalsService.get(signalsService.SIGNALS.ITEMADDED);
      signal.memorize = true;

      signalsService.emit(signalsService.SIGNALS.ITEMADDED, 1);

      setTimeout(function() {
        //first listener increments 1
        expect(value).toBe(1);

        signalsService.listen(signalsService.SIGNALS.ITEMADDED, function( v ) {
          value += (2 * v);
        });

        setTimeout(function() {
          //second listener increments 2 (last emit v=1 was memorized)
          expect(value).toBe(3);

          signalsService.emit(signalsService.SIGNALS.ITEMADDED, 2);

          setTimeout(function() {
            //first listener increments 2 v=2
            //second listener increments 4 --> 2*v
            expect(value).toBe(9);

            signalsService.emit(signalsService.SIGNALS.ITEMADDED, 3);
            //first listener increments 3 v=3
            //second listener increments 6 --> 2*v
            //here value=18

            signalsService.listen(signalsService.SIGNALS.ITEMADDED, function( v ) {
              value += (-6 * v);
            });
            setTimeout(function() {
              //third listen receives last memorized 3
              //decrements 18 v=3 ---> 6*v
              expect(value).toBe(0);

              signalsService.forget(signalsService.SIGNALS.ITEMADDED);

              //as forget as called the last emit value is forgotted and this listen is not automatically called with than tvalue (3)
              signalsService.listen(signalsService.SIGNALS.ITEMADDED, function( v ) {
                value += 3 * v;
              });

              signalsService.emit(signalsService.SIGNALS.ITEMADDED, 4);

              setTimeout(function() {
                //first listener increments 4 value=4
                //second listener increments 2*4 value=12
                //third listener decrements -6*4 value=-12
                //fourth listener increments 3*4 value=0
                expect(value).toBe(0);

                done();
              });
            });
          });
        });
      });
    });
  });

  describe('Test service functionality ("signal interface" invocation) ==> ', function() {
    var value;

    function callOnItemAdded( data ) {
      value = data.value;
    }

    function callOnItemRemoved( data ) {
      value = data.value;
    }

    beforeEach(function() {
      value = undefined;
    });

    afterEach(function() {
      try {
        signalsService.unlisten(signalsService.SIGNALS.ITEMADDED, callOnItemAdded);
        signalsService.unlisten(signalsService.SIGNALS.ITEMREMOVED, callOnItemRemoved);
      } catch( e ) {
      }
    });

    it('should call registered callback on emit event', function( done ) {
      signalsService.register(signalsService.SIGNALS.ITEMADDED);
      signalsService.itemadded.listen(callOnItemAdded);
      signalsService.itemadded.emit({value: 'called'});

      setTimeout(function() {
        expect(value).toBe('called');
        done();
      });
    });

    it('should evaluate if listeners are registered', function() {
      function IamNotListening() {
      }

      signalsService.register(signalsService.SIGNALS.ITEMADDED);
      signalsService.itemadded.listen(callOnItemAdded);
      expect(signalsService.itemadded.isListening(callOnItemAdded)).toBeTruthy();
      expect(signalsService.itemadded.isListening(IamNotListening)).toBeFalsy();
    });

    it('should evaluate number of listeners that are registered', function() {
      function IamListening() {
      }

      signalsService.register(signalsService.SIGNALS.ITEMADDED);
      expect(signalsService.itemadded.getNumListeners()).toBe(0);
      signalsService.itemadded.listen(callOnItemAdded);
      expect(signalsService.itemadded.getNumListeners()).toBe(1);
      signalsService.itemadded.listen(IamListening);
      expect(signalsService.itemadded.getNumListeners()).toBe(2);
    });

    it('should call registered callback on emit event more than once', function( done ) {
      signalsService.register(signalsService.SIGNALS.ITEMADDED);
      signalsService.itemadded.listen(callOnItemAdded);
      signalsService.itemadded.emit({value: 'called'});

      setTimeout(function() {
        expect(value).toBe('called');
        value = undefined;
        signalsService.itemadded.emit({value: 'called'});
        setTimeout(function() {
          expect(value).toBe('called');
          done();
        });
      });
    });

    it('should not call registered callback on emit event after unlisten', function( done ) {
      signalsService.register(signalsService.SIGNALS.ITEMADDED);
      signalsService.itemadded.listen(callOnItemAdded);
      signalsService.itemadded.emit({value: 'called'});

      setTimeout(function() {
        expect(value).toBe('called');
        value = undefined;
        signalsService.itemadded.unlisten(callOnItemAdded);
        signalsService.itemadded.emit({value: 'called'});

        setTimeout(function() {
          expect(value).not.toBeDefined();
          done();
        });

      });
    });

    it('should clear things on dispose', function( done ) {
      signalsService.register(signalsService.SIGNALS.ITEMADDED);
      signalsService.itemadded.listen(callOnItemAdded);
      var theSignal1 = signalsService.itemadded.get();

      signalsService.itemadded.emit({value: 'called'});

      setTimeout(function() {
        expect(value).toBe('called');
        value = undefined;

        signalsService.itemadded.dispose();

        signalsService.itemadded.emit({value: 'called'});
        var theSignal2 = signalsService.itemadded.get();

        setTimeout(function() {
          //since dispose clear listeners the listener should not be called even if the signal is recreated on the second emit
          //and signals should be different
          expect(value).not.toBeDefined();
          expect(theSignal1).not.toEqual(theSignal2);
          done();
        });

      });
    });

    it('should call registered callback only once on emit event', function( done ) {
      var value = 0;

      function callOnItemAdded() {
        value++;
      }

      signalsService.register(signalsService.SIGNALS.ITEMADDED);
      signalsService.itemadded.listen(callOnItemAdded, {addOnce: true});
      signalsService.itemadded.emit({});
      setTimeout(function() {
        expect(value).toBe(1);
        signalsService.itemadded.emit({});
        setTimeout(function() {
          expect(value).toBe(1);
          done();
        });
      });
    });

    it('should call registered callback by order on emit event', function( done ) {
      var value = 1;

      function callOnEventAdd3() {
        value += 3;
      }

      function callOnEventDivideBy2() {
        value = value / 2;
      }

      signalsService.register(signalsService.SIGNALS.ITEMADDED);
      signalsService.itemadded.listen(callOnEventAdd3);
      signalsService.itemadded.listen(callOnEventDivideBy2);
      signalsService.itemadded.emit({});

      setTimeout(function() {
        expect(value).toBe(2);
        done();
      });
    });

    it('should call registered callback by priority on emit event', function( done ) {
      var value = 1;

      function callOnEventAdd3() {
        value += 3;
      }

      function callOnEventDivideBy2() {
        value = value / 2;
      }

      signalsService.register(signalsService.SIGNALS.ITEMADDED);
      signalsService.itemadded.listen(callOnEventAdd3);
      signalsService.itemadded.listen(callOnEventDivideBy2, {priority: 1});
      signalsService.itemadded.emit({});

      setTimeout(function() {
        expect(value).toBe(3.5);
        done();
      });
    });

    it('should call registered callback on emit event with context', function( done ) {
      /*jshint validthis:true*/
      function callOnItemAdded() {
        value = this;
      }

      signalsService.register(signalsService.SIGNALS.ITEMADDED);
      signalsService.itemadded.listen(callOnItemAdded, {listenerContext: {me: true}});
      signalsService.itemadded.emit({value: 'called'});

      setTimeout(function() {
        expect(value).toBeDefined();
        expect(value.me).toBeTruthy();
        done();
      });
    });

    it('should allow for curry arguments', function( done ) {
      /*jshint validthis:true*/
      function callOnItemAdded( from, name ) {
        value = from + name;
      }

      signalsService.register(signalsService.SIGNALS.ITEMADDED);
      var signalbinding = signalsService.itemadded.listen(callOnItemAdded);
      signalbinding.params = [ 'From John: ' ];
      signalsService.itemadded.emit('Hi!');

      setTimeout(function() {
        expect(value).toBe('From John: Hi!');
        done();
      });
    });

    it('should allow for remove correct listener/context', function( done ) {
      var value = 0;
      /*jshint validthis:true*/
      function callOnItemAdded() {
        value += this.me;
      }

      //each context add its me property to value variable
      var context1 = {me: 1}, context2 = {me: 2}, context3 = {me: 3}, context4 = {me: -10};
      signalsService.register(signalsService.SIGNALS.ITEMADDED);
      signalsService.itemadded.listen(callOnItemAdded, {listenerContext: context1});
      signalsService.itemadded.listen(callOnItemAdded, {listenerContext: context2});
      signalsService.itemadded.emit({});

      setTimeout(function() {
        expect(value).toBe(3);
        signalsService.itemadded.unlisten(callOnItemAdded, {listenerContext: context1});
        signalsService.itemadded.emit({});

        setTimeout(function() {
          expect(value).toBe(5);
          signalsService.itemadded.listen(callOnItemAdded, {listenerContext: context3});
          signalsService.itemadded.emit({});

          setTimeout(function() {
            expect(value).toBe(10);
            signalsService.itemadded.unlisten(callOnItemAdded, {listenerContext: context2});
            signalsService.itemadded.unlisten(callOnItemAdded, {listenerContext: context3});
            signalsService.itemadded.listen(callOnItemAdded, {listenerContext: context4});
            signalsService.itemadded.emit({});

            setTimeout(function() {
              expect(value).toBe(0);
              done();
            });
          });
        });
      });
    });

    it('should remove all listeners', function( done ) {
      var value = 0;
      /*jshint validthis:true*/
      function callOnItemAdded1() {
        value++;
      }

      function callOnItemAdded2() {
        value++;
      }

      signalsService.register(signalsService.SIGNALS.ITEMADDED);
      signalsService.itemadded.listen(callOnItemAdded1);
      signalsService.itemadded.listen(callOnItemAdded2);
      signalsService.itemadded.emit({});

      setTimeout(function() {
        expect(value).toBe(2);
        value = 0;
        signalsService.itemadded.unlistenAll();
        signalsService.itemadded.emit({});

        setTimeout(function() {
          expect(value).toBe(0);
          done();
        });
      });
    });

    it('should memorize params emited and forget should work', function( done ) {
      var value = 0;
      /*jshint validthis:true*/
      signalsService.register(signalsService.SIGNALS.ITEMADDED);
      signalsService.itemadded.listen(function( v ) {
        value += v;
      });

      var signal = signalsService.itemadded.get();
      signal.memorize = true;

      signalsService.itemadded.emit(1);

      setTimeout(function() {
        //first listener increments 1
        expect(value).toBe(1);

        signalsService.itemadded.listen(function( v ) {
          value += (2 * v);
        });

        setTimeout(function() {
          //second listener increments 2 (last emit v=1 was memorized)
          expect(value).toBe(3);

          signalsService.itemadded.emit(2);

          setTimeout(function() {
            //first listener increments 2 v=2
            //second listener increments 4 --> 2*v
            expect(value).toBe(9);

            signalsService.itemadded.emit(3);
            //first listener increments 3 v=3
            //second listener increments 6 --> 2*v
            //here value=18

            signalsService.itemadded.listen(function( v ) {
              value += (-6 * v);
            });
            setTimeout(function() {
              //third listen receives last memorized 3
              //decrements 18 v=3 ---> 6*v
              expect(value).toBe(0);

              signalsService.itemadded.forget();

              //as forget as called the last emit value is forgotted and this listen is not automatically called with than tvalue (3)
              signalsService.itemadded.listen(function( v ) {
                value += 3 * v;
              });

              signalsService.itemadded.emit(4);

              setTimeout(function() {
                //first listener increments 4 value=4
                //second listener increments 2*4 value=12
                //third listener decrements -6*4 value=-12
                //fourth listener increments 3*4 value=0
                expect(value).toBe(0);

                done();
              });
            });
          });
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
