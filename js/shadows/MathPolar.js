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
				var constricted = Polar.constrict([diff, 0]);

				return constricted;
			}),
		proper: DEF(namespace,
			['angle'],
			function proper(angle){
				var proper = angle;

				while (proper > HALF_CIRCLE) {
					proper -= CIRCLE;
				}
				while (proper <= -HALF_CIRCLE) {
					proper += CIRCLE;
				}

				return proper;
			}),
		constrict: DEF(namespace,
			['angle', 'start'],
			function constrict(angle, start) {
				var constricted = angle;
				var end = start + CIRCLE;

				while (constricted >= end) {
					constricted -= CIRCLE;
				}
				while (constricted < start) {
					constricted += CIRCLE;
				}

				return constricted;
			}),
	};

	return obj;
})(Shadows || {}, Math);
