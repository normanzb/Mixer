define(['Promise'], function (Promise) {
    'use strict';

    function resolveAsIs(data) {
        return new Promise(function(resolve){
            resolve(data);
        });
    }

    function mashup(method1, method2, context) {
        var me = context || this;
        return function() {
            return method1.apply(me, arguments)
                .then(function() {
                    return method2.apply(me, arguments);
                });
        };
    }

    function Mixer(host, args, methods) {
        this.host = host;
        this.ctorArgs = args;
        this.methods = methods;
    }

    Mixer.prototype = {
        constructor: Mixer,
        mix: function() {
            var host = this.host;
            var args = this.ctorArgs;
            var allMethods = this.methods;
            var ctor;

            for ( var len = 0; len < arguments.length; len++ ) {
                ctor = arguments[len];

                if (typeof ctor != 'function') {
                    continue;
                }

                ctor.apply(host, args);
            }

            for ( var outer = allMethods.length; outer--;) {
                var method = allMethods[outer];
                
                for( var inner = 0; inner < arguments.length ; inner++) {
                    ctor = arguments[inner];

                    if ( host[method] == null ) {
                        host[method] = resolveAsIs;
                    }

                    if ( ctor && ctor.prototype[method] ) {
                        host[method] = mashup(host[method], ctor.prototype[method], host);
                    }

                }
            }
        },
        dispose: function() {
            this.host = null;
            this.ctorArgs = null;
        }
    };
    return Mixer;
});