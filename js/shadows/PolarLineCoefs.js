var Shadows = (function definePolarLineCoefs(obj, jsMath) {
	var Math = Shadows.Math, Polar = Math.Polar;
	var PolarLineCoefs = obj.PolarLineCoefs = CLASS('Shadows.PolarLineCoefs', {
		__init__:
			function __init__(self) {
				self.coefs = [];
				self.cached = {};
			},
		_isCached:
			function _isCached(self, line) {
				return (
					(self.cached.startDistance == line.start.distance) &&
					(self.cached.startAngle == line.start.angle) &&
					(self.cached.endDistance == line.end.distance) &&
					(self.cached.endAngle == line.end.angle));
			},
		_cache:
			function _cache(self, line) {
				self.cached.startDistance = line.start.distance;
				self.cached.startAngle = line.start.angle;
				self.cached.endDistance = line.end.distance;
				self.cached.endAngle = line.end.angle;
			},
		fromLine: DEF(
			['self', {n: 'line', is: ['Shadows.PolarLine']}],
			function fromLine(self, line) {
				if (!self._isCached([line])) {
					self.getCoefs([line]);
					var solution = Math.solve2x2([self.coefs]);

					self.coCos = solution.x;
					self.coSin = solution.y;
					self._cache([line]);
				}

				return self;
			}),
		getCoefs: DEF(
			['self', {n: 'line', is: ['Shadows.PolarLine']}],
			function getCoefs(self, line) {
				var coefs = self.coefs = [];

				coefs.push([
					jsMath.cos(line.start.angle),
					jsMath.sin(line.start.angle),
					1 / line.start.distance,
				]);
				coefs.push([
					jsMath.cos(line.end.angle),
					jsMath.sin(line.end.angle),
					1 / line.end.distance,
				]);
			}),
		atAngle:
			function atAngle(self, angle) {
				return 1 / (self.coCos * jsMath.cos(angle) + 
							self.coSin * jsMath.sin(angle));
			},
		intersectingAngle: DEF(
			['self', {n: 'other', is: ['Shadows.PolarLineCoefs']}],
			function offset(self, other) {
				var coCos = self.coCos - other.coCos,
					coSin = other.coSin - self.coSin;
				var angle;

				if (coSin != 0) {
					angle = jsMath.atan(coCos / coSin);
				} else {
					angle = 0;
				}

				var distance = self.atAngle([angle]);

				if (Math.CILt([distance, 0]) ||
					Math.CIEq([1 / distance, 0])) {
					angle += Polar.HALF_CIRCLE;
				}

				angle = Polar.proper([angle]);

				return angle;
			}),
	});

	return obj;
})(Shadows || {}, Math);
