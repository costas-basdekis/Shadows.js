var Shadows = (function defineWalls(obj) {
	var Walls = obj.Walls = CLASS('Shadows.Walls', {
		__init__:
			function __init__(self) {
				self.clear();
			},
		clear:
			function clear(self) {
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
				self.addPolygon([first, second, third, fourth])
			},
		addPolygon: DEF(
			['self', '*'],
			function addPolygon(self, points) {
				var prevPoint = points[points.length - 1];
				for (var i = 0, point ; point = points[i] ; i++) {
					self.addLine({start: prevPoint, end: point});
					prevPoint = point;
				}
			}),
	});

	return obj;
})(Shadows || {});
