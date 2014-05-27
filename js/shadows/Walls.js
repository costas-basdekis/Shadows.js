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
		addRegularPolygon: 
			function addRegularPolygon(self, center, radius, count) {
				var point = {}, prevPoint = {};

				for (var i = 0 ; i < count ; i++) {
					var angle = (i - 1) * Math.PI * 2 / count;
					prevPoint.x = Math.cos(angle) * radius + center.x;
					prevPoint.y = Math.sin(angle) * radius + center.y;
					var angle = i * Math.PI * 2 / count;
					point.x = Math.cos(angle) * radius + center.x;
					point.y = Math.sin(angle) * radius + center.y;
					self.addLine({start: prevPoint, end: point});
				}
			},
		addStar: 
			function addStar(self, center, smallRadius, bigRadius, count) {
				var point = {}, prevPoint = {};

				for (var i = 0 ; i < count * 2 ; i++) {
					var angle = (i - 1) * Math.PI * 2 / (count * 2);
					var radius = ((i + 1) % 2) ? smallRadius : bigRadius;
					prevPoint.x = Math.cos(angle) * radius + center.x;
					prevPoint.y = Math.sin(angle) * radius + center.y;
					var angle = i * Math.PI * 2 / (count * 2);
					var radius = (i % 2) ? smallRadius : bigRadius;
					point.x = Math.cos(angle) * radius + center.x;
					point.y = Math.sin(angle) * radius + center.y;
					self.addLine({start: prevPoint, end: point});
				}
			},
	});

	return obj;
})(Shadows || {});
