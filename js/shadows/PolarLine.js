var Shadows = (function definePolarLine(obj) {
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
		toString: METHOD(DEF(
			['self'],
			function toString(self) {
				var str = 'Polar %s - %s'.interpolate(self.start, self.end);

				return str;
			})),
	});

	return obj;
})(Shadows || {});
