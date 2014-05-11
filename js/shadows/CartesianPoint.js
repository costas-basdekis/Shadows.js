var Shadows = (function defineCartesianPoint(obj) {
	var CartesianPoint = obj.CartesianPoint = CLASS('Shadows.CartesianPoint', {
		__init__: METHOD(DEF(
			['self', {n: 'x', d: 0}, {n: 'y', d: 0}],
			function __init__(self, x, y) {
				self.__super__({name: '__init__'})();

				self.set({x:x, y:y});
			})),
		__copy__: METHOD(DEF(
			['self'],
			function __copy__(self) {
				return CartesianPoint({
					x: self.x,
					y: self.y,
				});
			})),
		copyFrom: METHOD(DEF(
			['self', {n: 'other', is: ['Shadows.CartesianPoint']}],
			function copyFrom(self, other) {
				self.set({
					x: other.x,
					y: other.y,
				});

				return self;
			})),
		toString: METHOD(DEF(
			['self'],
			function toString(self) {
				return '[%s,%s]'.interpolate(Math.round(self.x), Math.round(self.y));
			})),
		set: METHOD(DEF(
			['self', 'x', 'y'],
			function (self, x, y) {
				self.x = x;
				self.y = y;
			})),
		equals: METHOD(DEF(
			['self', {n: 'other', is: ['Shadows.CartesianPoint']}],
			function equals(self, other) {
				return Shadows.Math.CIEq([self.x, other.x]) &&
					   Shadows.Math.CIEq([self.y, other.y]);
			})),
		length: METHOD(DEF(
			['self'],
			function length(self) {
				return Math.sqrt(self.x * self.x + self.y * self.y);
			})),
		plus: METHOD(DEF(
			['self', {n:'other', is: ['Shadows.CartesianPoint']}],
			function plus(self, other) {
				self.x += other.x;
				self.y += other.y;

				return self;
			})),
		minus: METHOD(DEF(
			['self', {n:'other', is: ['Shadows.CartesianPoint']}],
			function minus(self, other) {
				self.x -= other.x;
				self.y -= other.y;

				return self;
			})),
		getAngle: METHOD(DEF(
			['self'],
			function getAngle(self) {
				var angle;

				if (Shadows.Math.CINEq([self.x, 0])) {
					angle = Math.atan(self.y / self.x);
					if (self.x < 0) {
						angle = angle + Math.PI;
					}
				} else {
					if (Shadows.Math.CIGEq([self.y, 0])) {
						angle = Math.PI / 2;
					} else {
						angle = -Math.PI / 2;
					}
				}

				var proper = Shadows.Math.Polar.proper([angle]);

				return proper;
			})),
		toPolar: METHOD(DEF(
			['self'],
			function toPolar(self) {
				var polar = Shadows.PolarPoint();
				polar.fromCartesian([self]);

				return polar;
			})),
		fromPolar: METHOD(DEF(
			['self', {n: 'other', is: ['Shadows.PolarPoint']}],
			function fromPolar(self, other) {
				self.set({
					x: other.distance * Math.cos(other.angle),
					y: other.distance * Math.sin(other.angle),
				});
			})),
	});

	return obj;
})(Shadows || {});
