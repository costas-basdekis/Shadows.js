True = true;
False = false;
None = null;

//This can be potentionaly slow, if var has a complex toString
function isArray(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
}

function isObject(obj) {
	return (obj !== null) && (typeof obj === 'object');
}

//Taken from underscore
function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

//This is not the Python bool: [] and {} are true
function bool(obj) {
	return !!obj;
}

//This is the Python bool
function pbool(obj) {
	if (isArray(obj)) {
		return bool(obj.length);
	} else if (isObject(obj)) {
		return bool(keys(obj));
	} else {
		return bool(obj);
	}
}

//This is Chrome's console keys helper function, Python's dict.keys()
function keys(obj, butNot) {
	var objKeys = [];
	butNot = butNot || {};

	for (var key in obj) {
		if (obj.hasOwnProperty(key) &&
			!butNot.hasOwnProperty(key)) {
			objKeys.push(key);
		}
	}

	return objKeys;
}

function ExceptionBase(message, name) {
	if (this == window) {
		return new ExceptionBase(message, name);
	}

	this.message = message;
	this.name = name;
	this.stack = [];
}
ExceptionBase.prototype.toString = function () {
	return '%s: %s'.interpolate(this.name, this.message);
};

function DEFEXCEPTION(func, base) {
	//@todo: Have bases list, and be able to do a is-a
	var exceptionName = func.name;

	if (!base) {
		base = ExceptionBase;
	}

	if (typeof exceptionName === 'undefined') {
		exceptionName = func;
		func = base;
	}

	function decorated(message, name) {
		return func.call(this, message, name || exceptionName);
	}

	return decorated;
}

PythonException = DEFEXCEPTION('PythonException');

InterpolateException = DEFEXCEPTION('InterpolateException', PythonException);

String.prototype.interpolate = (function defineInterpolate() {
	//@todo: Implement named interpolation
	var re = /%[s%]/g;

	function argToString(obj) {
		if (obj === undefined) {
			str = '<undefined>';
		} else if (obj === null) {
			str = '<null>';
		} else if (isFunction(obj.toString)) {
			str = obj.toString();
		} else {
			var protoName = 'Object';

			if (this.prototype && this.prototype.name) {
				protoName = this.prototype.name;
			}

			str = '[object ' + obj.prototype.name + ']';
		}

		return str;
	}

	function interpolateReplace(args, index) {
		if (index >= args.length) {
			throw InterpolateException('Interpolate got too many arguments');
		}

		var thisArg = args[index];
		var thisStr = argToString(thisArg);

		return thisStr;
	}

	function interpolate() {
		var index = 0;
		var args = arguments;

		var result = this.replace(re, function replace(matched) {
			if (matched == '%%') {
				return '%';
			} else {
				var thisIndex = index, thisArg = args[index];
				index++;

				return interpolateReplace(args, thisIndex);
			}
		});

		if (index < args.length) {
			throw InterpolateException('Interpolate got too few arguments');
		}

		return result;
	}

	return interpolate;
})();

DefException = DEFEXCEPTION('DefException', PythonException);
CallException = DEFEXCEPTION('CallException', PythonException);

//Make a function be called Python style:
//argDefs: an array of variable names, or variable definitions - optional, implied empty:
//{name:n,		//Name
// default:d,	//Default value - optional
// args:a,		//Is *args? - optional, implied false
// kwargs:k}	//Is **kwargs? - optional, implied false
//allowArgs: pass an *args argument as list
//allowKWargs: pass an **kwargs argument as dict
//func: the actual function
//To call this, pass a list and an array, or ommit any if they are empty
//Passing the wrong arguments by position or name, raises a relevant exception
//Example:
//f1 = DEF(['a'. 'b'], function f1(a, b) {
//	return a + b;
//});
//f1([1, 2]) == f1([1], {b: 2}) == f1({a:1, b:2})
DEF = (function defineDEF() {
	function DE(defObj, message) {
		var msg = 'def %s: %s'.interpolate(defObj.fullname, message);
		var e = DefException(msg);

		return e;
	}

	function CE(argObj, message) {
		var msg = '%s(): %s'.interpolate(argObj.defObj.fullname, message);
		var e = CallException(msg);
		//Use this so that the first try-catch doesn't show an extra message
		e.__localexception__ = True;

		return e;
	}

	function collectArgDefItem(defObj, arg, argDef, names) {
		var hasDef = false, mainName = names[0];

		//At most one name should be defined
		for (var i = 0, name ; name = names[i] ; i++) {
			if (arg.hasOwnProperty(name)) {
				if (hasDef) {
					throw DE(defObj, "Only use one synomym for '%s'".interpolate(mainName));
				}
				argDef[mainName] = arg[name];
				hasDef = true;
			}
		}

		return hasDef;
	}

	function collectArgumentDefinition(defObj, arg) {
		var argDef = {};

		if (!collectArgDefItem(defObj, arg, argDef, ['name', 'n'])) {
			argDef.name = arg;

			//Allow shorthand for args and kwargs
			if (arg == '*') {
				argDef.args = true;
			}
			if (arg == '**') {
				argDef.kwargs = true;
			}

			return argDef;
		}

		if (collectArgDefItem(defObj, arg, argDef, ['default', 'd'])) {
			argDef.hasDefault = true;
		}

		if (collectArgDefItem(defObj, arg, argDef, ['isinstance', 'is-a', 'is'])) {
			if (!isArray(argDef.isinstance)) {
				throw DE(defObj, "isinstance must be an array");
			}
		}

		var hasDefault = collectArgDefItem(defObj, arg, argDef, ['default', 'd']);
		var hasDynamicDefault = collectArgDefItem(defObj, arg, argDef, ['dynamicdefault', 'dd']);
		if (hasDynamicDefault) {
			if (!isFunction(argDef.dynamicdefault)) {
				throw DE(defObj, "dynamicdefault must be function, not %s"
					.interpolate(argDef.dynamicdefault));
			}
		}

		if (hasDefault && hasDynamicDefault) {
			throw DE(defObj, "Specify default XOR dynamicdefault");
		}

		if (hasDefault) {
			argDef.hasDefault = true;
		}
		if (hasDynamicDefault) {
			argDef.hasDynamicDefault = true;
		}

		if (collectArgDefItem(defObj, arg, argDef, ['args', '*'])) {
			argDef.args = bool(argDef.args);
		}

		if (collectArgDefItem(defObj, arg, argDef, ['kwargs', '**'])) {
			argDef.kwargs = bool(arg.kwargs);
		}

		return argDef;
	}

	function storeArgumentDefinition(defObj, argDef) {
		if (isObject(argDef.name)) {
			throw DE(defObj, 'You must provide a name for the argument');
		}

		if (defObj.argDict.hasOwnProperty(argDef.name)) {
			throw DE(defObj, 'Argument "%s" was defined multiple times'.interpolate(argDef.Name));
		}
		defObj.argDict[argDef.name] = true;

		if (argDef.hasDefault) {
			defObj.argDefaults[argDef.name] = argDef.default;
			defObj.usingDefaults = true;
		} else if (argDef.hasDynamicDefault) {
			defObj.argDynamicDefaults[argDef.name] = argDef.dynamicdefault;
			defObj.usingDefaults = true;
		} else {
			if (defObj.usingDefaults) {
				throw DE(defObj, 'Only the last arguments can have defaults');
			}
		}

		defObj.argNames.push(argDef.name);
	}

	function handleArgumentDefinition(defObj, argDef) {
		if (argDef.args && argDef.kwargs) {
			throw DE(defObj, 'Same argument can\'t be *args and **kwargs');
		}

		if (argDef.args) {
			if (defObj.allowArgs) {
				throw DE(defObj, 'At most one argument can be *args');
			}
			if (defObj.allowKWargs) {
				throw DE(defObj, '*args should be just before **kwargs');
			}
			if (argDef.hasDefault) {
				throw DE(defObj, '*args can\'t have a default value');
			}

			defObj.allowArgs = true;
		} else if (argDef.kwargs) {
			if (defObj.allowKWargs) {
				throw DE(defObj, 'At most one argument can be *kwargs');
			}
			if (argDef.hasDefault) {
				throw DE(defObj, '**kargs can\'t have a default value');
			}

			defObj.allowKWargs = true;
		} else {
			if (defObj.allowKWargs) {
				throw DE(defObj, 'Can\'t have arguments after **kwargs');
			} else if (defObj.allowArgs) {
				throw DE(defObj, 'Can\'t have arguments after *args');
			}

			storeArgumentDefinition(defObj, argDef);
		}
	}

	function collectArgumentDefinitions(defObj) {
		if (!isArray(defObj.argDefs)) {
			throw DE(defObj, 'Arguments were not passed');
		}

		//Keep a set of defined argument names
		defObj.argNames = [];
		defObj.argDict = {};
		defObj.argDefaults = {};
		defObj.argDynamicDefaults = {};
		defObj.usingDefaults = false;
		defObj.allowArgs = false;
		defObj.allowKWargs = false;
		for (var i = 0 ; i < defObj.argDefs.length ; i++) {
			var arg = defObj.argDefs[i];
			var argDef = collectArgumentDefinition(defObj, arg);
			defObj.argDefs[i] = argDef;

			handleArgumentDefinition(defObj, argDef);
		}
	}

	function makeDEF(defObj) {
		//Allow the definitions to be implied as empty
		if (defObj.arguments.length == 1) {
			defObj.func = defObj.arguments[0];
			defObj.namespace = '';
			defObj.argDefs = [];
		} else if (defObj.arguments.length == 2) {
			defObj.func = defObj.arguments[1];
			if (isArray(defObj.arguments[0])) {
				defObj.argDefs = defObj.arguments[0];
				defObj.namespace = '';
			} else {
				defObj.argDefs = [];
				defObj.namespace = defObj.arguments[0];
			}
		} else if (defObj.arguments.length != 3) {
			throw DE(defObj, 'More than definitions, namespace and function were passed');
		}
		if (!isFunction(defObj.func)) {
			throw DE(defObj, 'A function was not passed');
		}
		defObj.funcname = defObj.func.__funcname__ || defObj.func.name;

		collectArgumentDefinitions(defObj);
	}

	function checkPased(argObj) {
		//Allow not passed args or kwargs to be implied as empty
		if (argObj.arguments.length == 0) {
			argObj.args = [];
			argObj.kwargs = {};
		} else if (argObj.arguments.length == 1) {
			if (isArray(argObj.arguments[0])) {
				argObj.args = argObj.arguments[0];
				argObj.kwargs = {};
			} else {
				argObj.args = []
				argObj.kwargs = argObj.arguments[0];;
			}
		} else if (argObj.arguments.length != 2) {
			throw CE(argObj, 'More than *args and **kwargs was passed');
		}

		if (!isArray(argObj.args)) {
			throw CE(argObj, '*args was not an array');
		}
		if (!isObject(argObj.kwargs)) {
			throw CE(argObj, '**kwargs was not an object');
		} else if (isinstance(argObj.kwargs, object)) {
			throw CE(argObj, '**kwargs should not be a Python object - did you ' +
							 'forget to use Python.js style argument passing?');
		}
	}

	function collectArgs(argObj) {
		//Deal with args
		if (argObj.args.length > argObj.defObj.argNames.length) {
			if (!argObj.defObj.allowArgs) {
				throw CE(argObj, 'More *args than allowed where passed');
			}
			argObj.passArgs = argObj.args.slice(argObj.defObj.argNames.length);
			argObj.args = argObj.args.slice(0, argObj.defObj.argNames.length);
		}
		for (var i = 0 ; i < argObj.args.length ; i++) {
			var argName = argObj.defObj.argNames[i], argValue = argObj.args[i];
			argObj.passArgumentsDict[argName] = argValue;
		}
	}

	function collectKWargs(argObj) {
		//Deal with kwargs
		var kwargsKeys = keys(argObj.kwargs);
		for (var i = 0 ; i < kwargsKeys.length ; i++) {
			var argName = kwargsKeys[i], argValue = argObj.kwargs[argName];

			if (!argObj.defObj.argDict.hasOwnProperty(argName)) {
				if (!argObj.defObj.allowKWargs) {
					throw CE(argObj, 'Unspecified argument named "%s" was passed'.interpolate(argName));
				}

				argObj.passKWargs[argName] = argValue;
			} else {
				if (argObj.passArgumentsDict.hasOwnProperty(argName)) {
					throw CE(argObj, 'Argument "%s" was passed twice'.interpolate(argName));
				}

				argObj.passArgumentsDict[argName] = argValue;
			}
		}
	}

	function makeArgumentsArray(argObj) {
		//Make arguments array
		for (var i = 0 ; i < argObj.defObj.argNames.length ; i++) {
			var argName = argObj.defObj.argNames[i], hasArg = argObj.passArgumentsDict.hasOwnProperty(argName);
			var argValue;

			if (!hasArg) {
				var hasDefault = argObj.defObj.argDefaults.hasOwnProperty(argName);
				var hasDynamicDefault = argObj.defObj.argDynamicDefaults.hasOwnProperty(argName);
				if (!hasDefault && !hasDynamicDefault) {
					throw CE(argObj, 'Argument "%s" was not passed'.interpolate(argName));
				}

				if (hasDefault) {
					argValue = argObj.defObj.argDefaults[argName];
				} else {
					var dd = argObj.defObj.argDynamicDefaults[argName];
					argValue = dd();
				}
			} else {
				argValue = argObj.passArgumentsDict[argName];
			}

			argObj.passArguments.push(argValue);
		}
	}

	function validateArguments(argObj) {
		for (var i = 0, argDef ; argDef = argObj.defObj.argDefs[i] ; i++) {
			if (i >= argObj.passArguments.length) {
				break;
			}
			var arg = argObj.passArguments[i];
			if (arg === null) {
				continue;
			}
			if (typeof arg == "undefined") {
				throw CE(argObj, "%s was 'undefined', which is not allowed".interpolate(argDef.name));
			}

			if (argDef.isinstance) {
				var isA = false;
				for (var j = 0, cls ; cls = argDef.isinstance[j] ; j++) {
					//Get class by name
					if (CLASSES[cls]) {
						cls = CLASSES[cls];
					}

					if (isinstance(arg, cls)) {
						isA = true;
						break;
					}
				}
				if (!isA) {
					var argType = typeof arg;
					if (arg.__fullname__) {
						argType = arg.__fullname__;
					} else if (arg.__class__) {
						argType = arg.__class__.__fullname__;
					}
					throw CE(argObj, "%s was of unacceptable type %s, not %s"
						.interpolate(argDef.name, argType, 
									 argDef.isinstance.join(', ')))
				}
			}
		}
	}

	function callFunction(argObj) {
		//Call function
		var result;

		var args = argObj.passArguments;

		if (argObj.defObj.allowArgs) {
			args.push(argObj.passArgs);
		}
		if (argObj.defObj.allowKWargs) {
			args.push(argObj.passKWargs);
		}

		argObj.result = argObj.defObj.func.apply(argObj.this, args);

		return argObj.result;
	}

	function callDEF(argObj) {
		checkPased(argObj);
		collectArgs(argObj);
		collectKWargs(argObj);
		makeArgumentsArray(argObj);
		validateArguments(argObj);
		callFunction(argObj);

		return argObj.result;
	}

	function handleException(argObj, e) {
		if (e.__localexception__ == True) {
			e.__localexception__ = False;
			console.error(e.toString());
			e.stack.push(argObj);
		} else if (e.__localexception__ == False) {
			console.error('in %s()'.interpolate(argObj.defObj.fullname));
			e.stack.push(argObj);
		} else {
			console.error('in %s(): %s'.interpolate(argObj.defObj.fullname, e));
		}
	}

	function decorate(defObj) {
		var func = defObj.func;

		function pythonFunction(args, kwargs) {
			var argObj = {
				this: this,

				defObj: defObj,

				arguments: arguments,
				args: args,
				kwargs: kwargs,

				passArguments: [],
				passArgumentsDict: {},
				passArgs: [],
				passKWargs: {},
			};

			try {
				callDEF(argObj);
			} catch (e) {
				handleException(argObj, e);
				throw e;
			}

			return argObj.result;
		}

		pythonFunction.__func__ = defObj.func;

		return pythonFunction;
	}

	function putMetaData(defObj, decorated) {
		defObj.fullname = defObj.func.name;
		if (defObj.namespace) {
			defObj.fullname = '%s.%s'.interpolate(
				defObj.namespace, defObj.fullname);
		}
		decorated.__funcdef__ = defObj;
		decorated.__funcname__ = defObj.fullname;
	}

	function DEF(namespace, argDefs, func) {
		var defObj = {
			argDefs: argDefs,
			func: func,
			namespace: namespace,
			arguments: arguments,
		};

		makeDEF(defObj);

		var decorated = decorate(defObj);
		putMetaData(defObj, decorated);

		return decorated;
	}

	return DEF;
})();

KeyException = DEFEXCEPTION('KeyException');
ClassException = DEFEXCEPTION('ClassException');

object = null;
CLASSES = {};
function isinstance(obj, cls) {
	if (!obj || !obj.__class__) {
		return false;
	}
	if (!cls) {
		return false;
	}
	if (cls.__class_def__) {
		cls = cls.__class_def__;
	}
	if (!cls.__PYTHON_CLASS__) {
		return false;
	}

	var objCls = obj.__class__;

	while (objCls) {
		if (objCls == cls) {
			return true;
		}
		objCls = objCls.__base__;
	}

	return false;
}
//Make a class Python style:
//base: A base Python class - optional, implied object
//name: The class's name
//cls: The class, Python style
//An instance has access to it's super methods with obj.__super__(cls, 'func_name')
CLASS = (function defineCLASS() {
	function setBase(base, name, cls) {
		//Special case for the first class
		if (object === null) {
			base = None;
		} else {
			if (!base) {
				base = object;
			}

			if (!base || !base.__class_def__ || !base.__class_def__.__PYTHON_CLASS__) {
				throw ClassException('Base is not a python class');
			}
		}

		cls.__PYTHON_CLASS__ = true;
		cls.__base__ = base && base.__class_def__;

		setName(cls, name);
		setMethodsName(cls);
	}

	function setName(cls, name) {
		var lIO = name.lastIndexOf('.');
		if (lIO != -1) {
			cls.__namespace__ = name.substr(0, lIO);
			cls.__name__ = name.substr(lIO + 1);
		} else {
			cls.__name__ = name;
		}
		cls.__name__ = cls.__name__ || '<anonymous>';
		if (cls.__namespace__) {
			cls.__fullname__ = '%s.%s'.interpolate(cls.__namespace__, cls.__name__);
		} else {
			cls.__fullname__ = cls.__name__;
		}

		if (cls.__namespace__) {
			if (CLASSES[cls.__fullname__]) {
				throw ClassException('Class %s already defined'.interpolate(cls.__fullname__));
			}
			CLASSES[cls.__fullname__] = cls;
		}
	}

	function setMethodsName(cls) {
		if (!cls.__namespace__) {
			return;
		}

		var clsKeys = getBaseKeys(cls);

		for (var i = 0, key ; key = clsKeys[i] ; i++) {
			var method = cls[key];
			var defObj = method.__funcdef__;
			if (defObj) {
				defObj.namespace = cls.__fullname__;
				defObj.fullname = '%s.%s'.interpolate(defObj.namespace, defObj.funcname);
			}
		}
	}

	function bind(method, self) {
		var bound;

		if (method.hasOwnProperty('__bind__')) {
			bound = method.__bind__(method, self);
			//Name instance or class bound function
			if (bound.__bound__ == 'instance') {
				bound.__funcdef__.fullname = 'instance-bound of %s'.interpolate(
					bound.__func__.__funcdef__.fullname);
			} else if (bound.__bound__ == 'class') {
				bound.__funcdef__.fullname = 'class-bound of %s'.interpolate(
					bound.__func__.__funcdef__.fullname);
			}
		} else {
			bound = method;
		}

		return bound;
	}

	function getBases(cls) {
		if (!cls.hasOwnProperty('__bases__')) {
			var bases = []
			var base = cls;

			while (base) {
				bases.unshift(base);
				base = base.__base__;
			}

			cls.__bases__ = bases;
		}

		return cls.__bases__;
	}

	function getBaseKeys(cls) {
		var clsKeys = keys(cls, {
			'__PYTHON_CLASS__': True,
			'__base__': True,
			'__name__': True,
		});

		return clsKeys;
	}

	function createObject(cls) {
		var obj = {};
		var bases = getBases(cls)

		var supers = obj.__supers__ = {};
		for (var i = 0 ; i < bases.length ; i++) {
			var base = bases[i];
			var baseKeys = getBaseKeys(base);
			var reverseI = bases.length - 1 - i;
			var super_ = supers[reverseI] = {};

			for (var j = 0 ; j < baseKeys.length ; j++) {
				var baseKey = baseKeys[j];
				var method = base[baseKey];
				var bound = bind(method, obj);

				obj[baseKey] = bound;
				super_[baseKey] = bound;
			}
		}

		obj.__class__ = cls;

		return obj;
	}

	function CLASS(base, name, cls) {
		if (arguments.length == 2) {
			cls = arguments[1];
			name = arguments[0];
			base = None;
		} else if (arguments.length != 3) {
			throw ClassException('More than base, name and class were passed');
		}

		setBase(base, name, cls);

		var __new__ = DEF(["*", "**"],
			function __new__(args, kwargs){
				var obj = createObject(cls);
				obj.__init__(args, kwargs);

				return obj;
			});

		__new__.__class_def__ = cls;
		cls.__new__ = __new__;

		return __new__;
	}

	return CLASS;
})();

//Method bound to an object
METHOD = (function defineMETHOD() {
	function bind(func, self) {
		var selfArgs = [self];

		var bound = DEF(["*", "**"],
			function bound(args, kwargs) {
				var allArgs = selfArgs.concat(args);
				var result = func(allArgs, kwargs)

				return result;
			});

		bound.__bound__ = 'instance';
		bound.__func__ = func;
		bound.__funcname__ = func.__funcname__ || func.name;

		return bound;
	}

	function METHOD(func) {
		func.__bind__ = bind;

		return func;
	};

	return METHOD;
})();

//Method bound to a class
CLASSMETHOD = (function defineCLASSMETHOD() {
	function bind(func, self) {
		var cls = self.__class__;
		var clsArgs = [cls];

		var bound = DEF([{args: True}, {kwargs: True}],
			function bound(args, kwargs) {
				var allArgs = clsArgs.concat(args);
				var result = func(allArgs, kwargs)

				return result;
			});

		bound.__bound__ = 'class';
		bound.__func__ = func;
		bound.__funcname__ = func.__funcname__ || func.name;

		return bound;
	}

	function CLASSMETHOD(func) {
		func.__bind__ = bind;

		return func;
	};

	return CLASSMETHOD;
})();

//Method not bound at all
STATICMETHOD = (function defineSTATICMETHOD() {
	function bind(func, self) {
		func.__func__ = func;
		return func;
	}

	function STATICMETHOD(func) {
		func.__bind__ = bind;

		return func;
	};

	return STATICMETHOD;
})();

//The base class of all Python classes
object = CLASS(None, 'object', {
	__maxuuid__: 0,
	__init__: METHOD(DEF(['self'],
		function __init__(self) {
			self.__uuid__ = object.__class_def__.__maxuuid__;
			object.__class_def__.__maxuuid__++;
		})),
	__copy__: METHOD(DEF(['self'],
		function __copy__(self) {
			return object();
		})),
	__deepcopy__: METHOD(DEF(['self'],
		function __deepcopy__(self) {
			return self.__copy__();
		})),
	__getattr__: METHOD(DEF(
		['self', 'name', {name:'def', default:None}, {name:'cls', default:None}],
		function __getattr__(self, name, def, cls) {
			if (self.hasOwnProperty(name)) {
				return self[name];
			}

			if (!cls) {
				cls = self.__class__;
			}

			do {
				if (cls.hasOwnProperty(name)) {
					return cls[name];
				}
				cls = cls.__base__;
			} while (cls)

			return def;
		})),
	__super__: METHOD(DEF(['self', {name:'cls', default:None}, {name:'name', default:None}],
		function __super__(self, cls, name) {
			if (cls === None) {
				cls = self.__class__;
			}

			var i = 1;
			var base = self.__class__;

			while (base) {
				if (cls == base) {
					break;
				}
				i++;
				base = base.__base__;
			}

			if (cls != base) {
				throw PythonException('"%s" isn\'t a base of "%s"'.interpolate(
					cls.__name__, self.__class__.__name__))
			}

			while (base) {
				if (self.__supers__[i].hasOwnProperty(name)) {
					return self.__supers__[i][name];
				}
				i++;
				base = base.__base__;
			}

			throw KeyException('%s'.interpolate(name));
		})),
	toString: METHOD(DEF(['self'],
		function toString(self) {
			return '<%s at #%s>'.interpolate(self.__class__.__name__, self.__uuid__);
		})),
});
