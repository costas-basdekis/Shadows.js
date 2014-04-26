var Shadows = (function defineShadows(obj) {
	var CartesianLine = obj.CartesianLine = CLASS('CartesianLine', {
		__init__: METHOD(DEF(
			['self', {name:'start', default:None}, {name:'end', default:None}],
			function __init__(self, start, end) {
				self.__super__({name: '__init__'})();

				self.start = start || Shadows.CartesianPoint();
				self.end = end || Shadows.CartesianPoint();
			})),
		__copy__: METHOD(DEF(
			['self'],
			function __copy__(self) {
				return CartesianLine({
					start: self.start,
					end: self.end,
				});
			})),
		__deepcopy__: METHOD(DEF(
			['self'],
			function __deepcopy__(self) {
				return CartesianLine({
					start: self.start.__deepcopy__(),
					end: self.end.__deepcopy__(),
				});
			})),
		length: METHOD(DEF(
			['self'],
			function length(self) {
				var diff = self.end.__copy__().minus([self.start]);
				return diff.length();
			})),
	});

	return obj;
})(Shadows || {});