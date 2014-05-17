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
			},
		equals: (DEF(
			['self', {n: 'other', is: ['Shadows.PolarPoint']}],
			function equals(self, other) {
				return Shadows.Math.CIEq([self.angle, other.angle]) &&
					   Shadows.Math.CIEq([self.distance, other.distance]);
			})),
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
				self.angle = angle;
				self.distance = line.interpolate([angle]);

				return self;
			}),
	});

	return obj;
})(Shadows || {});
