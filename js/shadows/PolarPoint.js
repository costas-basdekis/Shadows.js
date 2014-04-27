var Shadows = (function definePolarPoint(obj) {
	var PolarPoint = obj.PolarPoint = CLASS('Shadows.PolarPoint', {
		__init__: METHOD(DEF(
			['self', {name:'angle', default:0}, {name:'distance', default:0}],
			function __init__(self, angle, distance) {
				self.__super__({name: '__init__'})();

				self.set({angle: angle, distance: distance});
			})),
		__copy__: METHOD(DEF(
			['self'],
			function __copy__(self) {
				return PolarPoint({
					angle: self.angle,
					distance: self.distance,
				});
			})),
		set: METHOD(DEF(
			['self', 'angle', 'distance'],
			function (self, angle, distance) {
				self.angle = angle;
				self.distance = distance;
			})),
		equals: METHOD(DEF(
			['self', {n: 'other', is: ['Shadows.PolarPoint']}],
			function equals(self, other) {
				return Shadows.Math.CIEq([self.angle, other.angle]) &&
					   Shadows.Math.CIEq([self.distance, other.distance]);
			})),
		offsetAngle: METHOD(DEF(
			['self', 'angle'],
			function offsetAngle(self, angle) {
				self.angle = Shadows.Math.Polar.angleDiff([angle, self.angle]);

				return self;
			})),
		fromCartesian: METHOD(DEF(
			['self', {n: 'other', is:['Shadows.CartesianPoint']}],
			function fromCartesian(self, other) {
				self.angle = other.getAngle();
				self.distance = other.length();

				return self;
			})),
		toString: METHOD(DEF(
			['self'],
			function toString(self) {
				var distance = Shadows.Math.round([self.distance, 2]);
				var angle = Shadows.Math.round([self.angle, 2]);
				var str = '[%s @%s]'.interpolate(distance, angle);

				return str;
			})),
	});

	return obj;
})(Shadows || {});
