var Shadows = (function definePolarLine(obj) {
	var Math = Shadows.Math;
	var PolarLine = obj.PolarLine = CLASS('Shadows.PolarLine', {
		__init__: METHOD(DEF(
			['self', 
			 {n: 'start', dd: Shadows.PolarPoint, is: [Shadows.PolarPoint]},
			 {n: 'end', dd: Shadows.PolarPoint, is: [Shadows.PolarPoint]}],
			function __init__(self, start, end) {
				self.__super__({name: '__init__'})();

				self.start = start;
				self.end = end;
			})),
		__copy__: METHOD(DEF(
			['self'],
			function __copy__(self) {
				return PolarLine({
					start: self.start,
					end: self.end,
				});
			})),
		__deepcopy__: METHOD(DEF(
			['self'],
			function __deepcopy__(self) {
				return PolarLine({
					start: self.start.__deepcopy__(),
					end: self.end.__deepcopy__(),
				});
			})),
		fromCartesian: METHOD(DEF(
			['self', {n: 'other', is: ['Shadows.CartesianLine']}],
			function fromCartesian(self, other) {
				self.start.fromCartesian([other.start]);
				self.end.fromCartesian([other.end]);

				return self;
			})),
		toCartesian: METHOD(DEF(
			['self'],
			function toCartesian(self) {
				var cartesian = Shadows.CartesianLine();
				cartesian.fromPolar([self]);

				return cartesian;
			})),
		toString: METHOD(DEF(
			['self'],
			function toString(self) {
				var str = 'Polar %s - %s'.interpolate(self.start, self.end);

				return str;
			})),
		equals: METHOD(DEF(
			['self', {n: 'other', is: ['Shadows.PolarLine']}],
			function equals(self, other) {
				return self.start.equals(other.start) &&
					   self.end.equals(other.end);
			})),
		isEmpty: METHOD(DEF(
			['self'],
			function isEmpty(self) {
				return Shadows.Math.CIEq([self.start.angle, self.end.angle]);
			})),
		isOnPoint: METHOD(DEF(
			['self'],
			function isOnPoint(self) {
				// If either endpoint is on 0, or the angle between is 180
				return Shadows.Math.CIEq([self.start.distance, 0]) ||
					   Shadows.Math.CIEq([self.end.distance, 0]) ||
					   Shadows.Math.CIEq([
					   		Shadows.Math.Polar.angleDiff([self.start.distance,
					   									 self.end.distance]),
					   		Shadows.Math.Polar.HALF_CIRCLE,
					   	]);
			})),
		containsAngle: METHOD(DEF(
			['self', 'angle'],
			function containsAngle(self, angle) {
				var startDiff, sectionLength;

				startDiff = Shadows.Math.Polar.angleDiff([self.start.angle, angle]);
				sectionLength = Shadows.Math.Polar.angleDiff([self.start.angle,
													  self.end.angle]);

				return Shadows.Math.CILt([0, startDiff]) &&
					   Shadows.Math.CILt([startDiff, sectionLength]);
			})),
		hasSameRange: METHOD(DEF(
			['self', {n: 'other', is: ['Shadows.PolarLine']}],
			function hasSameRange(self, other) {
				return (
					Shadows.Math.CIEq([self.start.angle, other.start.angle]) &&
					Shadows.Math.CIEq([self.end.angle, other.end.angle]));
			})),
		intersects: METHOD(DEF(
			['self', {n: 'other', is: ['Shadows.PolarLine']}],
			function intersects(self, other) {
				return (
					self.containsAngle([other.start.angle]) || 
					self.containsAngle([other.end.angle]) || 
					other.containsAngle([self.start.angle]) ||
					other.containsAngle([self.end.angle]) || 
					self.hasSameRange([other]));
			})),
		isAdjacentTo: METHOD(DEF(
			['self', {n: 'other', is: ['Shadows.PolarLine']}, {n: 'inOrder', d: False}],
			function isAdjacentTo(self, other, inOrder) {
				var isBefore = Shadows.Math.CIEq([self.end.angle, other.start.angle]);

				if (isBefore) {
					return True;
				}

				if (inOrder) {
					return False;
				}

				var isAfter = Shadows.Math.CIEq([other.end.angle, self.start.angle]);

				return isAfter;
			})),
	});

	return obj;
})(Shadows || {});
