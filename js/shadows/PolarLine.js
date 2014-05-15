var Shadows = (function definePolarLine(obj, jsMath) {
	var Math = Shadows.Math, Polar = Math.Polar;
	var PolarLine = obj.PolarLine = CLASS('Shadows.PolarLine', {
		__init__: DEF(
			['self', 
			 {n: 'start', dd: Shadows.PolarPoint, is: [Shadows.PolarPoint]},
			 {n: 'end', dd: Shadows.PolarPoint, is: [Shadows.PolarPoint]}],
			function __init__(self, start, end) {
				self.__super__({name: '__init__'})();

				self.start = start;
				self.end = end;
			}),
		__copy__: 
			function __copy__(self) {
				return PolarLine({
					start: self.start,
					end: self.end,
				});
			},
		__deepcopy__: 
			function __deepcopy__(self) {
				return PolarLine({
					start: self.start.__deepcopy__(),
					end: self.end.__deepcopy__(),
				});
			},
		copyFrom: DEF(
			['self', {n: 'other', is: ['Shadows.PolarLine']}],
			function copyFrom(self, other) {
				self.start.copyFrom([other.start]);
				self.end.copyFrom([other.end]);

				return self;
			}),
		fromCartesian: DEF(
			['self', {n: 'other', is: ['Shadows.CartesianLine']}],
			function fromCartesian(self, other) {
				self.start.fromCartesian([other.start]);
				self.end.fromCartesian([other.end]);

				self.proper();

				return self;
			}),
		toCartesian: 
			function toCartesian(self) {
				var cartesian = Shadows.CartesianLine();
				cartesian.fromPolar([self]);

				return cartesian;
			},
		toString: 
			function toString(self) {
				var str = 'Polar %s - %s'.interpolate(self.start, self.end);

				return str;
			},
		equals: DEF(
			['self', {n: 'other', is: ['Shadows.PolarLine']}],
			function equals(self, other) {
				return self.start.equals(other.start) &&
					   self.end.equals(other.end);
			}),
		isProper: 
			function isProper(self) {
				var diff = Polar.angleDiff([self.start.angle, self.end.angle]);

				return Math.CILt([diff, Polar.HALF_CIRCLE]);
			},
		proper: 
			function proper(self) {
				if (!self.isProper()) {
					var temp = self.start;
					self.start = self.end;
					self.end = temp;
				}

				return self;
			},
		isEmpty: 
			function isEmpty(self) {
				return Math.CIEq([self.start.angle, self.end.angle]);
			},
		isOnPoint: 
			function isOnPoint(self) {
				// If either endpoint is on 0, or the angle between is 180
				return Math.CIEq([self.start.distance, 0]) ||
					   Math.CIEq([self.end.distance, 0]) ||
					   Math.CIEq([
					   		Polar.angleDiff([self.start.distance,
					   									 self.end.distance]),
					   		Polar.HALF_CIRCLE,
					   	]);
			},
		containsAngle: 
			function containsAngle(self, angle) {
				var startDiff, sectionLength;

				startDiff = Polar.angleDiff([self.start.angle, angle]);
				sectionLength = Polar.angleDiff([self.start.angle,
												 self.end.angle]);

				return Math.CILt([0, startDiff]) &&
					   Math.CILt([startDiff, sectionLength]);
			},
		containsAngleOrStart: 
			function containsAngleOrStart(self, angle) {
				var startDiff, sectionLength;

				startDiff = Polar.angleDiff([self.start.angle, angle]);
				sectionLength = Polar.angleDiff([self.start.angle,
												 self.end.angle]);

				return Math.CILEq([0, startDiff]) &&
					   Math.CILt([startDiff, sectionLength]);
			},
		containsAngleOrEnd: 
			function containsAngleOrEnd(self, angle) {
				var startDiff, sectionLength;

				startDiff = Polar.angleDiff([self.start.angle, angle]);
				sectionLength = Polar.angleDiff([self.start.angle,
												 self.end.angle]);

				return Math.CILt([0, startDiff]) &&
					   Math.CILEq([startDiff, sectionLength]);
			},
		hasSameRange: DEF(
			['self', {n: 'other', is: ['Shadows.PolarLine']}],
			function hasSameRange(self, other) {
				return (
					Math.CIEq([self.start.angle, other.start.angle]) &&
					Math.CIEq([self.end.angle, other.end.angle]));
			}),
		intersects: DEF(
			['self', {n: 'other', is: ['Shadows.PolarLine']}],
			function intersects(self, other) {
				return (
					self.containsAngle([other.start.angle]) || 
					self.containsAngle([other.end.angle]) || 
					other.containsAngle([self.start.angle]) ||
					other.containsAngle([self.end.angle]) || 
					self.hasSameRange([other]));
			}),
		isAdjacentTo: DEF(
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
			}),
		isBetween: DEF(
			['self', {n: 'before', is: ['Shadows.PolarLine']}, {n: 'after', is: ['Shadows.PolarLine']}],
			function isBetween(self, before, after) {
				var beforeDiff = Polar.angleDiff([before.end.angle, self.start.angle]);
				var between = Polar.angleDiff([before.end.angle, after.start.angle]);

				return Math.CILt([beforeDiff, between]);
			}),
		interpolate: 
			function interpolate(self, angle) {
				var coefs = Shadows.PolarLineCoefs();
				coefs.fromLine([self]);

				return coefs.atAngle([angle]);
			},
		limitToAngles: DEF(
			['self', {n: 'other', is: ['Shadows.PolarLine']}],
			function limitToAngles(self, other) {
				if (self.containsAngleOrStart([other.start.angle])) {
					self.start.interpolateLine([self, other.start.angle]);
				}
				if (self.containsAngleOrEnd([other.end.angle])) {
					self.end.interpolateLine([self, other.end.angle]);
				}

				return self;
			}),
		atAngles: DEF(
			['self', {n: 'other', is: ['Shadows.PolarLine']}],
			function atAngles(self, other) {
				self.start.interpolateLine([self, other.start.angle]);
				self.end.interpolateLine([self, other.end.angle]);

				return self;
			}),
	});

	return obj;
})(Shadows || {}, Math);
