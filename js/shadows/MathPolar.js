var Shadows = (function defineMathPolar(obj, jsMath) {
	var Math = obj.Math;

	var CIRCLE = 2 * jsMath.PI;

	var namespace = 'Shadows.MathPolar';
	var Polar = Math.Polar = {
		angleDiff: DEF(namespace,
			['start', 'end'],
			function angleDiff(start, end) {
				var diff = end - start;

				while (diff > CIRCLE) {
					diff -= CIRCLE;
				}
				while (diff <= -CIRCLE) {
					diff += CIRCLE;
				}

				return diff;
			}),
		proper: DEF(namespace,
			['angle'],
			function proper(angle){
				var proper = angle;

				while (proper > jsMath.PI) {
					proper -= CIRCLE;
				}
				while (proper <= -jsMath.PI) {
					proper += CIRCLE;
				}

				return proper;
			}),
	};

	return obj;
})(Shadows || {}, Math);
