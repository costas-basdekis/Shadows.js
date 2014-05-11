var Shadows = (function defineCartesianLine(obj) {
	var CartesianLine = obj.CartesianLine = CLASS('Shadows.CartesianLine', {
		__init__: METHOD(DEF(
			['self', {n: 'start', d: None}, {n: 'end', d: None}],
			function __init__(self, start, end) {
				self.__super__({name: '__init__'})();

				self.start = start || Shadows.CartesianPoint();
				self.end = end || Shadows.CartesianPoint();
			})),
		__copy__: METHOD(DEF(
			['self'],
			function __copy__(self) {
				return CartesianLine({
					start: self.start,
					end: self.end,
				});
			})),
		__deepcopy__: METHOD(DEF(
			['self'],
			function __deepcopy__(self) {
				return CartesianLine({
					start: self.start.__deepcopy__(),
					end: self.end.__deepcopy__(),
				});
			})),
		toString: METHOD(DEF(
			['self'],
			function toString(self) {
				return '[%s - %s]'.interpolate(self.start, self.end);
			})),
		copyFrom: METHOD(DEF(
			['self', {n: 'other', is:['Shadows.CartesianLine']}],
			function copyFrom (self, other) {
				self.start.copyFrom([other.start]);
				self.end.copyFrom([other.end]);
			})),
		length: METHOD(DEF(
			['self'],
			function length(self) {
				var diff = self.end.__copy__().minus([self.start]);
				return diff.length();
			})),
		plus: METHOD(DEF(
			['self', {n: 'point', is: [Shadows.CartesianPoint]}],
			function (self, point) {
				self.start.plus([point]);
				self.end.plus([point]);

				return self;
			})),
		minus: METHOD(DEF(
			['self', {n: 'point', is: [Shadows.CartesianPoint]}],
			function (self, point) {
				self.start.minus([point]);
				self.end.minus([point]);

				return self;
			})),
		toPolar: METHOD(DEF(
			['self'],
			function toPolar(self) {
				var polar = Shadows.PolarLine();
				polar.fromCartesian([self]);

				return polar;
			})),
		fromPolar: METHOD(DEF(
			['self', {n: 'other', is: ['Shadows.PolarLine']}],
			function fromPolar(self, other) {
				self.start.fromPolar([other.start]);
				self.end.fromPolar([other.end]);
			})),
	});

	return obj;
})(Shadows || {});
