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
			['lhs', 'rhs'],
			function compare(lhs, rhs) {
				var diff = rhs - lhs;

				if (jsMath.abs(diff) < this.Epsilon) {
					return this.Compare.Equal;
				} else {
					return (diff < 0) ? this.Compare.LessThan :
										this.Compare.GreaterThan;
				}
			}),
		compareInfix: DEF(namespace,
			['lhs', 'desired', 'rhs'],
			function compareInfix(lhs, desired, rhs) {
				var result = this.compare([lhs, rhs]);

				if (desired == this.Compare.LessThanOrEqual) {
					return result <= desired;
				} else if (desired == this.Compare.GreaterThanOrEqual) {
					return result >= desired;
				} else {
					return result == desired;
				}
			}),
		CI: DEF(namespace,
			['lhs', 'desired', 'rhs'],
			function CI(lhs, desired, rhs) {
				return this.compareInfix([lhs, desired, rhs]);
			}),
		CIEq: DEF(namespace,
			['lhs', 'rhs'],
			function CIEq(lhs, rhs) {
				return this.compareInfix([lhs, this.Compare.Equal, rhs]);
			}),
		CINEq: DEF(namespace,
			['lhs', 'rhs'],
			function CINEq(lhs, rhs) {
				return !this.compareInfix([lhs, this.Compare.Equal, rhs]);
			}),
		CIGEq: DEF(namespace,
			['lhs', 'rhs'],
			function CIGEq(lhs, rhs) {
				return !this.compareInfix([lhs, this.Compare.GreaterThanOrEqual, rhs]);
			}),
		CIGt: DEF(namespace,
			['lhs', 'rhs'],
			function CIGt(lhs, rhs) {
				return !this.compareInfix([lhs, this.Compare.GreaterThan, rhs]);
			}),
	};

	return obj;
})(Shadows || {}, Math);
