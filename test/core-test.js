var fun = require("../src")
// aliases
  , id = fun.id
  , isNull = fun.isNull
  , isDefined = fun.isDefined
  , isArray = fun.isArray
  , isString = fun.isString
  , isFunction = fun.isFunction
  , isInfinity = fun.isInfinity
  , isObject = fun.isObject
  , isNumber = fun.isNumber
  , isInteger = fun.isInteger
  , isRegexp = fun.isRegexp
  , arg = fun.arg
  , If = fun.If
  , curry = fun.curry
  , autoCurry = fun.autoCurry
  , compose = fun.compose
  , util = require("./util")
// tape module
  , test = require("tape");

test("id", function(t) {
    t.plan(3);
    util.assertFunction(t, 1, id);
    t.equal(id(1, 2), 1, t.name + " only returns the first argument");
});

test("isNull", function(t) {
    t.plan(4);
    util.assertFunction(t, 1, isNull);
    t.ok(isNull(null), t.name + " returns true for null");
    t.notOk(isNull(undefined)
          && isNull(2)
          && isNull("foo")
          && isNull([])
          && isNull({})
          && isNull(function(){})
          && isNull(false)
           , t.name + " returns false for everything else");
});

test("isDefined", function(t) {
    t.plan(4);
    util.assertFunction(t, 1, isDefined);
    t.notOk(isDefined(undefined), t.name + " returns true for undefined");
    t.ok(isDefined(false)
       && isDefined(null)
       && isDefined(1)
       && isDefined("foo")
       && isDefined([])
       && isDefined({})
       && isDefined(function(){})
        , t.name + " returns false for everything else");
});

test("isArray", function(t) {
    t.plan(5);
    util.assertFunction(t, 1, isArray);
    t.ok(isArray([]), t.name + " returns true for Array literals");
    t.ok(isArray(new Array(4)), t.name + " returns true for Array instances");
    t.notOk(isArray(null)
          && isArray(undefined)
          && isArray(1)
          && isArray(false)
          && isArray("foo")
          && isArray({})
          && isArray(function(){})
           , t.name + "returns false for everything else");
});

test("isString", function(t) {
    t.plan(5);
    util.assertFunction(t, 1, isString);
    t.ok(isString("foo"), t.name + " returns true for String literals");
    t.ok(isString(new String("foo")), t.name + " returns true for String instances");
    t.notOk(isString(null)
          && isString(undefined)
          && isString(1)
          && isString(true)
          && isString([])
          && isString({})
          && isString(function(){})
           , t.name + "returns false for everything else");
});

test("isFunction", function(t) {
    t.plan(4);
    util.assertFunction(t, 1, isFunction); // circular logic!
    t.ok(isFunction(function(){}), t.name + " returns true for Function's");
    t.notOk(isFunction(null)
          && isFunction(undefined)
          && isFunction(1)
          && isFunction("foo")
          && isFunction(true)
          && isFunction([])
          && isFunction({})
           , t.name + "returns false for everything else");
});

test("isInfinity", function(t) {
    t.plan(4);
    util.assertFunction(t, 1, isInfinity);
    t.ok(isInfinity(Infinity), t.name + " returns true for Infinity");
    t.notOk(isInfinity(null)
          && isInfinity(undefined)
          && isInfinity(1)
          && isInfinity("foo")
          && isInfinity(true)
          && isInfinity([])
          && isInfinity({})
          && isInfinity(function(){})
           , t.name + "returns false for everything else");
});

test("isObject", function(t) {
    t.plan(5);
    util.assertFunction(t, 1, isObject);
    t.ok(isObject({}), t.name + " returns true for Object literals");
    t.ok(isObject(new Object({ foo: "bar" })), t.name + " returns true for Object instances");
    t.notOk(isObject(null)
          && isObject(undefined)
          && isObject(1)
          && isObject("foo")
          && isObject(true)
          && isObject([])
          && isObject(function(){})
           , t.name + "returns false for everything else");
});

test("isNumber", function(t) {
    t.plan(5);
    util.assertFunction(t, 1, isNumber);
    t.ok(isNumber(99), t.name + " returns true for Number literals");
    t.ok(isNumber(new Number(99)), t.name + " returns true for Number instances");
    t.notOk(isNumber(null)
          && isNumber(undefined)
          && isNumber("foo")
          && isNumber(true)
          && isNumber([])
          && isNumber({})
          && isNumber(function(){})
           , t.name + "returns false for everything else");
});

test("isInteger", function(t) {
    t.plan(5);
    util.assertFunction(t, 1, isInteger);
    t.ok(isInteger(99), t.name + " returns true for Number literals that are integers");
    t.ok(isInteger(new Number(99)), t.name + " returns true for Number instances that are integers");
    t.notOk(isInteger(null)
          && isInteger(undefined)
          && isInteger("foo")
          && isInteger(true)
          && isInteger([])
          && isInteger(4.5)
          && isInteger({})
          && isInteger(function(){})
           , t.name + "returns false for everything else");
});

test("isRegexp", function(t) {
    t.plan(5);
    util.assertFunction(t, 1, isRegexp);
    t.ok(isRegexp(/foo/), t.name + " returns true for RegExp literals");
    t.ok(isRegexp(new RegExp(/foo/)), t.name + " returns true for RegExp instances");
    t.notOk(isRegexp(null)
          && isRegexp(undefined)
          && isRegexp("foo")
          && isRegexp(true)
          && isRegexp([])
          && isRegexp(4.5)
          && isRegexp({})
          && isRegexp(function(){})
           , t.name + "returns false for everything else");
});

test("arg", function(t) {
    t.plan(6);
    util.assertFunction(t, 1, arg);
    var succ = " returns a function that returns the nth argument (0-indexed)";
    t.equal(arg(1)(1, 2, 3), 2, t.name + succ);

    function passneg()   { arg(-4);    }
    function passnon()   { arg("foo"); }
    function passfloat() { arg(1.1);   }

    util.assertThrows(t, passneg, "passed a negative integer");
    util.assertThrows(t, passnon, "passed a non-number");
    util.assertThrows(t, passfloat, "passed a float");
});

test("If", function(t) {
    t.plan(3);
    util.assertFunction(t, 1, If);
    t.ok(If(true).Then(true).Else(false)
       && If(false).Then(false).Else(true)
       && If(false).Then(false).Elif(true).Then(true)
        , t.name + " provides an If/Elif/Else control structure");
});

test("curry", function(t) {
    t.plan(4);
    util.assertFunction(t, 1, curry);
    function add(x, y) { return x + y; }
    var add1 = curry(add, 1);
    t.ok(isFunction(add1), t.name + " partially applies functions");
    var bad = function() { curry("foo", 1); };
    util.assertThrows(t, bad, "the first argument is not a function");
});

test("autoCurry", function(t) {
    t.plan(4);
    util.assertFunction(t, 2, autoCurry);
    util.assertFunction(t, 1, Function.prototype.autoCurry);
});

test("compose", function(t) {
    t.plan(3);
    util.assertFunction(t, 0, compose);
    function greet(name) { return "Hi, " + name; }
    function capitalize(word) {
        return word[0].toUpperCase() + word.substr(1).toLowerCase();
    }
    var greetPerson = compose(greet, capitalize);

    t.equal(greetPerson("klaatu"), "Hi, Klaatu"
           , t.name + " composes functions in right-to-left order");
});

// TODO: test the rest of the core module