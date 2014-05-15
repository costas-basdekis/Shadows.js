var Shadows = (function definePolarLineCoefs(obj, jsMath) {
	var Math = Shadows.Math, Polar = Math.Polar;
	var PolarLineCoefs = obj.PolarLineCoefs = CLASS('Shadows.PolarLineCoefs', {
		__init__:
			function __init__(self) {
				self.coefs = [];
			},
		fromLine: DEF(
			['self', {n: 'line', is: ['Shadows.PolarLine']}],
			function fromLine(self, line) {
				self.getCoefs([line]);
				var solution = Math.solve2x2([self.coefs]);

				self.coCos = solution.x;
				self.coSin = solution.y;
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
	});

	return obj;
})(Shadows || {}, Math);
