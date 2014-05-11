var Shadows = (function definePolarLine(obj, jsMath) {
	var Math = Shadows.Math, Polar = Math.Polar;
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

				self.proper();

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
		isProper: METHOD(DEF(
			['self'],
			function isProper(self) {
				var diff = Polar.angleDiff([self.start.angle, self.end.angle]);

				return Math.CILt([diff, Polar.HALF_CIRCLE]);
			})),
		proper: METHOD(DEF(
			['self'],
			function proper(self) {
				if (!self.isProper()) {
					var temp = self.start;
					self.start = self.end;
					self.end = temp;
				}

				return self;
			})),
		isEmpty: METHOD(DEF(
			['self'],
			function isEmpty(self) {
				return Math.CIEq([self.start.angle, self.end.angle]);
			})),
		isOnPoint: METHOD(DEF(
			['self'],
			function isOnPoint(self) {
				// If either endpoint is on 0, or the angle between is 180
				return Math.CIEq([self.start.distance, 0]) ||
					   Math.CIEq([self.end.distance, 0]) ||
					   Math.CIEq([
					   		Polar.angleDiff([self.start.distance,
					   									 self.end.distance]),
					   		Polar.HALF_CIRCLE,
					   	]);
			})),
		containsAngle: METHOD(DEF(
			['self', 'angle'],
			function containsAngle(self, angle) {
				var startDiff, sectionLength;

				startDiff = Polar.angleDiff([self.start.angle, angle]);
				sectionLength = Polar.angleDiff([self.start.angle,
												 self.end.angle]);

				return Math.CILt([0, startDiff]) &&
					   Math.CILt([startDiff, sectionLength]);
			})),
		hasSameRange: METHOD(DEF(
			['self', {n: 'other', is: ['Shadows.PolarLine']}],
			function hasSameRange(self, other) {
				return (
					Math.CIEq([self.start.angle, other.start.angle]) &&
					Math.CIEq([self.end.angle, other.end.angle]));
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
				var isBefore = Math.CIEq([self.end.angle, other.start.angle]);

				if (isBefore) {
					return True;
				}

				if (inOrder) {
					return False;
				}

				var isAfter = Math.CIEq([other.end.angle, self.start.angle]);

				return isAfter;
			})),
	});

	return obj;
})(Shadows || {}, Math);
