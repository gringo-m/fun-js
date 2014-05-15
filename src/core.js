/* -*- mode: js2; -*-
 * @author Brian Sorahan
 * @license MIT
 * @title fun-js
 * @overview Haskell-esque programming in javascript
 *
 * Notes
 *
 * - This module is the foundation of fun-js.
 * - All other modules in fun-js will probably want to require this one.
 * - This module should *never* require any other.
 */

// Polyfills
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (! Object.keys) {
    Object.keys = (function () {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function (obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
if (! Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
        if ( this === undefined || this === null ) {
            throw new TypeError( '"this" is null or not defined' );
        }

        // Hack to convert object.length to a UInt32
        var length = this.length >>> 0;

        fromIndex = +fromIndex || 0;

        if (Math.abs(fromIndex) === Infinity) {
            fromIndex = 0;
        }

        if (fromIndex < 0) {
            fromIndex += length;
            if (fromIndex < 0) {
                fromIndex = 0;
            }
        }

        for (;fromIndex < length; fromIndex++) {
            if (this[fromIndex] === searchElement) {
                return fromIndex;
            }
        }

        return -1;
    };
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function(searchElement /*, fromIndex*/) {
        'use strict';

        if (this === void 0 || this === null) {
            throw new TypeError();
        }

        var n, k,
            t = Object(this),
            len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }

        n = len - 1;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) {
                n = 0;
            }
            else if (n != 0 && n != (1 / 0) && n != -(1 / 0)) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }

        for (k = n >= 0
             ? Math.min(n, len - 1)
             : len - Math.abs(n); k >= 0; k--) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };
}

if (! Array.prototype.forEach) {
    Array.prototype.forEach = function(f) {
        var i;
        for (i = 0; i < this.length; i++) {
            f(this[i], i);
        }
    };
}



// object which will get merged into module.exports
var ex = {};

//+ id :: _ -> _
ex.id = function(x) { return x; };

//+ isNull :: _ -> Boolean
ex.isNull = function(x) { return x === null; };
//+ isDefined :: _ -> Boolean
ex.isDefined = function(x) { return x !== undefined; };
//+ isArray :: _ -> Boolean
ex.isArray = (function() {
    if(! Array.isArray) {
        Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }

    return function(x) {
        return Array.isArray(x);
    };
})();

//+ isString :: _ -> Boolean
ex.isString = function(x) { return typeof x === "string" || x instanceof String; };
//+ isFunction :: _ -> Boolean
ex.isFunction = function(x) { return typeof x === "function"; };
//+ isInfinity :: _ -> Boolean
ex.isInfinity = function(x) { return x === Infinity; };

//+ isObject :: _ -> Boolean
ex.isObject = function(x) {
    return ex.isDefined(x) && !ex.isNull(x)
                           && !ex.isArray(x)
                           && (typeof x === "object");
};

//+ isNumber :: _ -> Boolean
ex.isNumber = function(x) {
    return ((typeof x === "number") && !isNaN(parseFloat(x))
                                    && isFinite(x))
        || (x instanceof Number);
};

//+ isInteger :: _ -> Boolean
ex.isInteger = function(x) {
    if (x instanceof Number) x = x.valueOf();
    return ex.isNumber(x) && Math.floor(x) === x;
};

//+ isRegexp :: _ -> Boolean
ex.isRegexp = function(x) {
    return (ex.isObject(x) && ex.isFunction(x.test)
                           && ex.isFunction(x.exec))
        || (x instanceof RegExp);
};

// arg :: _ -> _
ex.arg = function(n) {
    if (!ex.isInteger(n) || n < 0)
        throw new Error("arg expects a positive Integer");
    return function() {
        return arguments[n];
    };
};

//+ If   :: Boolean  -> Then
//+ Then :: Function -> {Elif|Else}
//+ Elif :: Function -> Else
//+ Else :: Function -> _
ex.If = function(p) {
    var Then = function(condition) {
        return function(f) {
            return {
                Elif: function(q) {
                    return {
                        Then: Then(q)
                    };
                },
                Else: function(g) {
                    return condition ? f : g;
                }
            };
        };
    };
    return {
        Then: Then(p)
    };
};

//- from wu.js <http://fitzgen.github.com/wu.js/>
//+ curry :: f -> _ ... -> g
ex.curry = function (fn) {
    if (!ex.isFunction(fn))
        throw new Error("curry expects a function as the first argument");
    var args = Array.prototype.slice.call(arguments, 1);
    return function () {
	    return fn.apply(fn, args.concat(Array.prototype.slice.call(arguments)));
    };
};

//- from wu.js <http://fitzgen.github.com/wu.js/>
//+ autoCurry :: Function -> Function
ex.autoCurry = function (fn, numArgs) {
    var expectedArgs = numArgs || fn.length;
    return function () {
        if (arguments.length < expectedArgs) {
            // A curried version of fn
            var curried = ex.curry.apply(this, [fn].concat(Array.prototype.slice.call(arguments)));
            var rem = numArgs - arguments.length;
            // If we still don't have the expected number of arguments,
            // return
            return expectedArgs - arguments.length > 0 ? ex.autoCurry(curried, rem) : curried;
        } else {
            return fn.apply(this, arguments);
        }
    };
};

//! Note that autoCurrying functions returns a function with arity 0
Function.prototype.autoCurry = function(n) {
    return ex.autoCurry(this, n || this.length);
};

//+ compose :: f -> g -> h
ex.compose = function() {
    var fns = Array.prototype.slice.call(arguments), numFns = fns.length;
    return function () {
        var i, returnValue = fns[numFns -1].apply(this, arguments);
        for (i = numFns - 2; i > -1; i--) {
            returnValue = fns[i](returnValue);
        }
        return returnValue;
    };
}.autoCurry();

//+ composer :: f -> g -> h
//! Just like compose, but with the order reversed.
ex.composer = function() {
    var fns = Array.prototype.slice.call(arguments), numFns = fns.length;
    return function () {
        var i, returnValue = fns[0].apply(this, arguments);
        for (i = 1; i < numFns; i++) {
            returnValue = fns[i](returnValue);
        }
        return returnValue;
    };
}.autoCurry();

//+ flip :: f -> g
ex.flip = function(f) {
    return function () {
	    return f(arguments[1], arguments[0]);
    };
};

//+ until :: (a -> Boolean) -> (a -> a) -> a -> a
//! until p f applies f until p holds
ex.until = function(p, f, x) {
    if (!ex.isFunction(p) || !ex.isFunction(f))
        throw new Error("until expects functions for the first two arguments");
    return p(x) ? x : ex.until(p, f, f(x));
}.autoCurry();

//+ equal :: a -> a -> Boolean
ex.equal = function (x, y) { return x == y; }.autoCurry();

//+ identical :: a -> a -> Boolean
ex.identical = function (x, y) { return x === y; }.autoCurry();

var deepEqualWith = function(cmp) {
    var deqw = function(a, b) {
        if (ex.isArray(a)) {
            if (! ex.isArray(b)) return false;

            return a.length === b.length && a.every(function(el, i) {
                return deqw(el, b[i]);
            });
        } else if (ex.isObject(a)) {
            if (! ex.isObject(b)) return false;

            var aprops = Object.keys(a);
            var bprops = Object.keys(b);

            return aprops.length === bprops.length && aprops.reduce(function(acc, p) {
                return acc && b.hasOwnProperty(p) && deqw(a[p], b[p]);
            }, true);
        } else {
            return cmp(a, b);
        }
    }.autoCurry();

    return deqw;
};

//+ deepEqual :: _ -> _ -> Boolean
ex.deepEqual = deepEqualWith(ex.identical);

//+ looseDeepEqual :: _ -> _ -> Boolean
ex.looseDeepEqual = deepEqualWith(ex.equal);

//+ and :: _ ... -> Boolean
ex.and = function () {
    var args = Array.prototype.slice.call(arguments);
	return args.reduce(function(acc, v) {
	    return acc && v;
	}, true);
}.autoCurry();

//+ or :: _ ... -> Boolean
ex.or = function () {
    var args = Array.prototype.slice.call(arguments);
	return args.reduce(function(acc, v) {
	    return acc || v;
	}, false);
}.autoCurry();

//+ not :: _ -> Boolean
ex.not = function(x) {
    return !x;
};

//+ pluck :: String -> Object -> _
ex.pluck = function (name, obj) {
    return obj[name];
}.autoCurry();

//+ dot :: Object -> String -> _
ex.dot = function(obj, name) {
    return obj[name];
}.autoCurry();

//+ has :: String -> Object -> Boolean
ex.has = function(name, obj) {
    return obj.hasOwnProperty(name);
}.autoCurry();

//+ instanceOf :: Object -> Object -> Boolean
ex.instanceOf = function(constructor, obj) {
    return obj instanceof constructor;
}.autoCurry();

ex.typeOf = function(T, val) {
    if (T.toLowerCase() === "object") {
        return ex.isObject(val);
    } else {
        return typeof val === T;
    }
}.autoCurry();

//+ objMap :: (String -> _ -> b) -> Object -> [b]
//! map over key/value pairs in an object
ex.objMap = function(f, obj) {
	var result = [], index = 0;

    if (ex.isObject(obj) || ex.isFunction(obj)) {
	    for (var property in obj) {
		    if (obj.hasOwnProperty(property)) {
			    result[index++] = f(property, obj[property]);
		    }
	    }
	    return result;
    } else {
        return undefined;
    }
}.autoCurry();

//+ keys :: Object -> [String]
ex.keys = ex.objMap(ex.arg(0));
//+ vals :: Object -> [_]
ex.vals = ex.objMap(ex.arg(1));

//+ merge :: Object -> Object -> Object
// Note: Properties of the second argument take precedence
//       over identically-named properties of the first
//       argument.
ex.merge = function(obj1, obj2) {
	var result = {};
    [obj1, obj2].forEach(function(obj) {
        for (var p in obj) {
            if (ex.has(p, obj)) {
                result[p] = obj[p];
            }
        }
    });
    return result;
}.autoCurry();

//+ reduceOwn :: Function -> Object -> Object
ex.reduceOwn = function(f, obj) {
    if (! ex.isFunction(f))
        throw new Error("reduceOwn expects a Function as the first argument");
    if (! ex.isObject(obj))
        throw new Error("reduceOwn expects an Object as the second argument");

    var wrapper = function(result, k) {
        f(result, k, obj[k]);
        return result;
    };

    return Object.keys(obj).reduce(wrapper, {});
}.autoCurry();

//+ filterOwn :: (Object -> String -> _ -> Boolean) -> Object -> Object
ex.filterOwn = function(f, obj) {
    if (! ex.isFunction(f))
        throw new Error("filterOwn expects the first argument to be a Function");
    if (! ex.isObject(obj))
        throw new Error("filterOwn expects the second argument to be an Object");

    var pick = function(result, key, val) {
        if (f(key, val)) {
            result[key] = val;
        }
    };
    return ex.reduceOwn(pick, obj);
}.autoCurry();

//+ functions :: {Object|Array} -> [ {Object|Array} ]
//! Return an array of the function names of an object.
//  Returns undefined if the object is not an Object.
ex.functions = function(obj) {
    if (ex.isArray(obj)) {
        return obj.filter(ex.isFunction);
    } else if (ex.isObject(obj) || ex.isFunction(obj)) {
        var f = function(acc, key, val) {
            return ex.isFunction(val);
        };
        return ex.filterOwn(f, obj);
    } else {
        return undefined;
    }
};



Object.keys(ex).forEach(function(prop) {
    module.exports[prop] = ex[prop];
});
