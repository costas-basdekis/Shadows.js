var Shadows = (function defineMath(obj, jsMath) {
	var namespace = 'Shadows.Math';
	var Math = obj.Math = {
		Epsilon: 1 / 2 * jsMath.pow(10, -5),
		Compare: {
			LessThan: -2,
			LessThanOrEqual: -1,
			Equal: 0,
			GreaterThanOrEqual: 1,
			GreaterThan: 2,
		},
		compare: DEF(namespace,
			function compare(lhs, rhs) {
				var diff = rhs - lhs;

				if (jsMath.abs(diff) < this.Epsilon) {
					return this.Compare.Equal;
				} else {
					return (diff > 0) ? this.Compare.LessThan :
										this.Compare.GreaterThan;
				}
			}),
		compareInfix: DEF(namespace,
			function compareInfix(lhs, desired, rhs) {
				var result = this.compare([lhs, rhs]);

				if (desired == this.Compare.LessThanOrEqual) {
					return result <= Math.Compare.Equal;
				} else if (desired == this.Compare.GreaterThanOrEqual) {
					return result >= Math.Compare.Equal;
				} else {
					return result == desired;
				}
			}),
		CI: DEF(namespace,
			function CI(lhs, desired, rhs) {
				return this.compareInfix([lhs, desired, rhs]);
			}),
		CIEq: DEF(namespace,
			function CIEq(lhs, rhs) {
				return this.compareInfix([lhs, this.Compare.Equal, rhs]);
			}),
		CINEq: DEF(namespace,
			function CINEq(lhs, rhs) {
				return !this.compareInfix([lhs, this.Compare.Equal, rhs]);
			}),
		CILEq: DEF(namespace,
			function CILEq(lhs, rhs) {
				return this.compareInfix([lhs, this.Compare.LessThanOrEqual, rhs]);
			}),
		CILt: DEF(namespace,
			function CILt(lhs, rhs) {
				return this.compareInfix([lhs, this.Compare.LessThan, rhs]);
			}),
		CIGEq: DEF(namespace,
			function CIGEq(lhs, rhs) {
				return this.compareInfix([lhs, this.Compare.GreaterThanOrEqual, rhs]);
			}),
		CIGt: DEF(namespace,
			function CIGt(lhs, rhs) {
				return this.compareInfix([lhs, this.Compare.GreaterThan, rhs]);
			}),
		round: DEF(namespace,
			['number', {n: 'digits', d: 0}],
			function round(number, digits) {
				digits = parseInt(digits);
				if (isNaN(digits) || digits < 0) {
					digits = 0;
				}

				var raised = jsMath.pow(10, digits);
				var rounded = jsMath.round(number * raised) / raised;

				return rounded;
			}),
		solve2x2: DEF(
			function solve2x2(coefs) {
				var d, dx, dy;

				d = Math.discriminate([coefs, 0, 0, 1, 1]);
				dx = Math.discriminate([coefs, 0, 2, 1, 1]);
				dy = Math.discriminate([coefs, 0, 0, 1, 2]);

				return {
					x: dx / d,
					y: dy / d,
				};
			}),
		discriminate: DEF(
			function discriminate(coefs, x1, y1, x2, y2) {
				return coefs[x1][y1] * coefs[x2][y2] - coefs[x1][y2] * coefs[x2][y1];
			}),
	};

	return obj;
})(Shadows || {}, Math);
