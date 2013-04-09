/**
 * fun.js
 * ====================
 * 
 * A mish-mash of useful functions to enable haskell-style
 * coding in js. Mostly taken from wu.js, loop-recur, and
 * underscore.js.
 * 
 * Usage
 * --------------------
 * - node.js
 * - browser
 */

var fun = {};
var slice = Array.prototype.slice;

//+ id :: _ -> _
fun.id = function(x) {
    return x;
};

//+ isNull :: _ -> Boolean
fun.isNull = function(obj) {
    return obj === null;
};

//+ isDefined :: _ -> Boolean
fun.isDefined = function(obj) {
    return typeof obj !== 'undefined';
};

//+ toArray :: a -> [b]
var toArray = function (arrish, n) {
    return typeof n === 'number' ?
	slice.call(arrish, n)
	: slice.call(arrish);
};

//- from wu.js <http://fitzgen.github.com/wu.js/>
//+ curry :: f -> _ ... -> g
var curry = function (fn) {
    var args = toArray(arguments, 1);
    return function () {
	return fn.apply(this, args.concat(toArray(arguments)));
    };
};

//- from wu.js <http://fitzgen.github.com/wu.js/>
//+ autoCurry :: Function -> Function
var autoCurry = function (fn, numArgs) {
    var expectedArgs = numArgs || fn.length;
    return function () {
        if (arguments.length < expectedArgs) {
            return expectedArgs - arguments.length > 0 ?
                autoCurry(curry.apply(this, [fn].concat(toArray(arguments))),
                          numArgs - arguments.length) :
                curry.apply(this, [fn].concat(toArray(arguments)));
        }
        else {
            return fn.apply(this, arguments);
        }
    };
};

Function.prototype.autoCurry = function(n) {
    return autoCurry(this, n);
};

//+ map :: (a -> b) -> [a] -> [b]
fun.map = function (fn, xs) {
    return xs.map(fn);
}.autoCurry();

//+ filter :: (a -> b) -> [a] -> [b]
fun.filter = function (fn, xs) {
    return xs.filter(fn);
}.autoCurry();

//+ reduce :: (a -> b -> b) -> [b] -> b
//+ reduce :: (a -> b -> b) -> b -> [b] -> b
fun.reduce = function (f, initialValue, xs) {
    return xs.reduce(f, initialValue);
}.autoCurry();

//+ compose :: f -> g -> h 
fun.compose = function () {
    var fns = toArray(arguments), numFns = fns.length;
    return function () {
        var i, returnValue = fns[numFns -1].apply(this, arguments);
        for (i = numFns - 2; i > -1; i--) {
            returnValue = fns[i](returnValue);
        }
        return returnValue;
    };
}.autoCurry();

//+ pluck :: String -> Object -> _
fun.pluck = function (name, obj) {
    return obj[name];
}.autoCurry();

//+ has :: String -> Object -> Boolean
fun.has = function(name, obj) {
    return obj.hasOwnProperty(name);
}.autoCurry();

//+ flip :: f -> g 
fun.flip = function(f) {
    return function () {
	return f(arguments[1], arguments[0]);
    };
};

//+ and :: _ ... -> Boolean
fun.and = function () {
    var args = slice.call(arguments);
    return function () {
	return reduce(function(acc, v) {
	    return acc && v;
	}, true, args.concat(slice.call(arguments)));
    };
}.autoCurry();

//+ or :: _ ... -> Boolean
fun.or = function () {
    var args = slice.call(arguments);
    return function () {
	return reduce(function(acc, v) {
	    return acc || v;
	}, false, args.concat(slice.call(arguments)));
    };
}.autoCurry();

//+ not :: _ -> Boolean
fun.not = function(x) {
    return !x;
};

//+ empty :: Array -> Boolean
fun.empty = function(xs) {
    return xs.length === 0;
};

//+ head :: [a] -> a
fun.head = function(xs) {
    return xs.length ? xs[0] : undefined;
};

//+ tail :: [a] -> a
fun.tail = function(xs) {
    return xs.length ? slice.call(xs, 1) : [];
};

//+ any :: (a -> Boolean) -> [a] -> Boolean
fun.any = function (f, xs) {
    return xs.length ? reduce(function(acc, x) {
	return acc || f(x);
    }, false, xs) : false;
}.autoCurry();

//+ all :: (a -> Boolean) -> [a] -> Boolean
fun.all = function (f, xs) {
    return xs.length ? reduce(function(acc, x) {
	return acc && f(x);
    }, true, xs) : false;
}.autoCurry();

//+ equal :: a -> a -> Boolean
// Note: type coercion
fun.equal = function (x, y) {
    return x == y;
}.autoCurry();

//+ identical :: a -> a -> Boolean
// Note: no type coercion
fun.identical = function (x, y) {
    return x === y;
}.autoCurry();

//+ gt :: a -> a -> Boolean
fun.gt = function(x, y) {
    return x < y;
}.autoCurry();

//+ gte :: a -> a -> Boolean
fun.gte = function(x, y) {
    return x <= y;
}.autoCurry();

//+ lt :: a -> a -> Boolean
fun.lt = function(x, y) {
    return x > y;
}.autoCurry();

//+ lte :: a -> a -> Boolean
fun.lte = function(x, y) {
    return x >= y;
}.autoCurry();

//+ incr :: Int -> Int
fun.incr = function(x) {
    return typeof x === 'number' ? x + 1 : undefined;
};

//+ decr :: Int -> Int
fun.decr = function(x) {
    return typeof x === 'number' ? x - 1 : undefined;
};

//+ zip :: (List ...) => [a] -> [b] -> ... -> [[a, b, ...]]
zip = function() {
    var n = Math.min.apply(null, map('.length',arguments)),
        results = new Array(n),
        key, i;
    for (i = 0; i < n; i++) {
	key = String(i);
	results[key] = map(pluck(key), arguments);
    };
    return results;
};

fun.globalize = function(globalObj) {
    [
	"id"
	, "isNull"
	, "isDefined"
	, "reduce"
	, "map"
	, "filter"
	, "compose"
	, "pluck"
	, "has"
	, "flip"
	, "and"
	, "or"
	, "not"
	, "empty"
	, "head"
	, "tail"
	, "any"
	, "all"
	, "equal"
	, "identical"
	, "gt"
	, "gte"
	, "lt"
	, "lte"
	, "incr"
	, "decr"
    ].map(function(prop) {
	globalObj[prop] = fun[prop];
    });
};

module.exports = fun;