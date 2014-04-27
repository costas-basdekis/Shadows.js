var Shadows = (function definePolarLine(obj) {
	var PolarLine = obj.PolarLine = CLASS('Shadows.PolarLine', {
		__init__: METHOD(DEF(
			['self', {name:'start', default:None}, {name:'end', default:None}],
			function __init__(self, start, end) {
				self.__super__({name: '__init__'})();

				self.start = start || Shadows.PolarPoint();
				self.end = end || Shadows.PolarPoint();
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
			['self', 'other'],
			function (self, other) {
				self.start.fromCartesian([other.start]);
				self.end.fromCartesian([other.end]);

				return self;
			})),
	});

	return obj;
})(Shadows || {});
