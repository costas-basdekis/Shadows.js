var Shadows = (function defineMathPolar(obj, jsMath) {
	var Math = obj.Math;

	var HALF_CIRCLE = jsMath.PI;
	var CIRCLE = 2 * HALF_CIRCLE;

	var namespace = 'Shadows.MathPolar';
	var Polar = Math.Polar = {
		CIRCLE: CIRCLE,
		HALF_CIRCLE: HALF_CIRCLE,
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
