var Shadows = (function defineWalls(obj) {
	var Walls = obj.Walls = CLASS('Shadows.Walls', {
		__init__:
			function __init__(self) {
				self.lines = [];
			},
		addLine:
			function addLine(self, start, end) {
				self.lines.push(Shadows.CartesianLine({
					start: Shadows.CartesianPoint(start),
					end: Shadows.CartesianPoint(end),
				}));
			},
		addBox: 
			function addBox(self, first, third) {
				var second = {x: third.x, y: first.y},
					fourth = {x: first.x, y: third.y};
				self.addLine({start: first, end: second});
				self.addLine({start: second, end: third});
				self.addLine({start: third, end: fourth});
				self.addLine({start: fourth, end: first});
			},
	});

	return obj;
})(Shadows || {});
