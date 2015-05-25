[![Build Status](https://travis-ci.org/borntorun/angular-jssignals.svg?branch=master)](https://travis-ci.org/borntorun/angular-jssignals)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

angular-jssignals
=======================

Angular service for https://github.com/millermedeiros/js-signals (Custom Event/Messaging system for JavaScript)

Requirements
------------

[angular.js] (https://angularjs.org/)

[js-signals](https://github.com/millermedeiros/js-signals) **version: ~1.0.0**

How to use
----------

Get and install the requirements.

* Install with Bower

```
$ bower install angular-jssignals
```

* or get the javascript in dist folder: angular-jssignals.js

[See the demo page](http://borntorun.github.io/angular-jssignals/)

## Use

Add the module to an angular application:

```javascript
angular.module('yourmodule', ['jsSignalsServiceModule']);
```

Configure the ```SignalsServiceProvider``` :

```javascript
angular.module('your-app-module', ['jsSignalsServiceModule'])
  .config(config);  
  /* @ngInject */
  function config(SignalsServiceProvider) {
    SignalsServiceProvider.config({      
      signals: {
          eventItemAdded: 'itemadded',
          eventItemRemoved: 'itemremoved'}
      }
    });
  }
```

Consume the service:

```javascript
angular.module('your-app-module', ['jsSignalsServiceModule'])
  .factory('ExamplePublishService', ExamplePublishService)
  /* config code ommitted */
  .controller('ExampleTriggerCtrl', ExampleTriggerCtrl)
  .controller('ExampleListenerCtrl', ExampleListenerCtrl);
  /* @ngInject */
  function ExamplePublishService( SignalsService ) {   
    //a service that adds things to something...        
    return {
      add: function( value ) {
        //... add thing code logic        
                
        //broadcast signal
        SignalsService.itemadded.emit(value);
      }
    }
  }
  
  /* @ngInject */
  function ExampleTriggerCtrl( ExamplePublishService ) {
    someHandler = function() {
      //some handler that calls the service that adds things
      ExamplePublishService.additem('some value');
    };
  }
  
  /* @ngInject */
  function ExampleListenerCtrl( SignalsService ) {
    //bound a listener to the event signal
    SignalsService.itemadded.listen(function( value ) {
      //some handler that wants to listen to signal when things are added
      //do something with value
    });
  }
```

## Service Interface

The service expose these methods that mimic the interface of js-signals Signal object:

- `register(key)`: register an event signal
- `emit(key, data)`: emit/publish/dispatch the signal to liteners
- `listen(key, callback, options)`: bound a listener handler to the signal
- `unlisten(key, callback, options)`: remove a listener handler from the emit/publish/dispatch queue
- `unlistenAll(key)`: removes all listener handlers from the emit/publish/dispatch queue (clear queue)
- `isListening(key, callback, options)`: verifies if listener handler is bound to the signal
- `getNumListeners(key)`: get number of listeners bounded to the signal
- `dispose(key)`: destroys the signal
- `forget(key)`: forget memorized data arguments
- `get(key)`: get the signal

Also, the service expose a property for each event signal registered:
 
So, if an event signal named 'itemadded' is registered we can do:
```javascript
SignalsService.itemadded.<emit|listen|unlisten|unlisten|isListening|getNumListeners|dispose|forget|get>(...);

//examples:
SignalsService.itemadded.listen(function() {
  //....
});

SignalsService.itemadded.emit(value);

var signal = SignalsService.itemadded.get();
```

For more information, consult [js-signals documentation](http://millermedeiros.github.io/js-signals/docs/) and/or the documentation and comments in the code.


Notes
---------------

* This is a work in progress.

Contribution
---------------

* Contributions and comments are welcome.

Authors
-------

* **João Carvalho** 
  * [@jmmtcarvalho](https://twitter.com/jmmtcarvalho) 
  * [GitHub](https://github.com/borntorun)

License
-------

Copyright (c) 2015 João Carvalho

Licensed under the MIT License
