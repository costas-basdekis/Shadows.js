var Shadows = (function definePolarPoint(obj) {
	var PolarPoint = obj.PolarPoint = CLASS('Shadows.PolarPoint', {
		__init__: DEF(
			['self', {name:'angle', default:0}, {name:'distance', default:0}],
			function __init__(self, angle, distance) {
				self.__super__({name: '__init__'})();

				self.set({angle: angle, distance: distance});
			}),
		__copy__: 
			function __copy__(self) {
				return PolarPoint({
					angle: self.angle,
					distance: self.distance,
				});
			},
		copyFrom: DEF(
			['self', {n: 'other', is: ['Shadows.PolarPoint']}],
			function copyFrom(self, other) {
				self.set({
					angle: other.angle,
					distance: other.distance,
				});

				return self;
			}),
		set: 
			function set(self, angle, distance) {
				self.angle = angle;
				self.distance = distance;

				return self;
			},
		equals: DEF(
			['self', {n: 'other', is: ['Shadows.PolarPoint']}],
			function equals(self, other) {
				return self.sameAngle([other]) &&
					   Shadows.Math.CIEq([self.distance, other.distance]);
			}),
		sameAngle: DEF(
			['self', {n: 'other', is: ['Shadows.PolarPoint']}],
			function sameAngle(self, other) {
				return Shadows.Math.CIEq([self.angle, other.angle]);
			}),
		offsetAngle: 
			function offsetAngle(self, angle) {
				self.angle = Shadows.Math.Polar.angleDiff([angle, self.angle]);
				self.angle = Shadows.Math.Polar.constrict([self.angle, -Shadows.Math.Polar.HALF_CIRCLE])

				return self;
			},
		fromCartesian: DEF(
			['self', {n: 'other', is:['Shadows.CartesianPoint']}],
			function fromCartesian(self, other) {
				self.angle = other.getAngle();
				self.distance = other.length();

				return self;
			}),
		toCartesian: 
			function toCartesian(self) {
				var cartesian = Shadows.CartesianPoint();
				cartesian.fromPolar([self]);

				return cartesian;
			},
		toString: 
			function toString(self) {
				var distance = Shadows.Math.round([self.distance, 2]);
				var angle = Shadows.Math.round([self.angle, 2]);
				var str = '[%s @%s]'.interpolate(distance, angle);

				return str;
			},
		interpolateLine: DEF(
			['self', {n: 'line', is: ['Shadows.PolarLine']}, 'angle'],
			function interpolateLine(self, line, angle) {
				var distance = line.interpolate([angle]);

				// Use this, as `self` can be part of `line`
				self.set({
					distance: distance,
					 angle: angle
				});

				return self;
			}),
	});

	return obj;
})(Shadows || {});
