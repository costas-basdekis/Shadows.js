var Shadows = (function defineShadows(obj) {
	var CartesianPoint = obj.CartesianPoint = CLASS('CartesianPoint', {
		__init__: METHOD(DEF(
			['self', {name:'x', default:0}, {name:'y', default:0}],
			function __init__(self, x, y) {
				self.__super__({name: '__init__'})();

				self.x = x;
				self.y = y;
			})),
		__copy__: METHOD(DEF(
			['self'],
			function __copy__(self) {
				return CartesianPoint({
					x: self.x,
					y: self.y,
				});
			})),
		length: METHOD(DEF(
			['self'],
			function length(self) {
				return Math.sqrt(self.x * self.x + self.y * self.y);
			})),
		minus: METHOD(DEF(
			['self', 'other'],
			function minus(self, other) {
				self.x -= other.x;
				self.y -= other.y;

				return self;
			})),
	});

	return obj;
})(Shadows || {});