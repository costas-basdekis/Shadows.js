var ShadowsApp = (function defineShadowsApp(obj, _) {
	App = obj;

	App.walls = [];
	App.wallsPath;

	App.createWalls = function createWalls() {
		this.addOuterBox();

		this.wallsPath = new _.Path();
		this.linesToPath(this.walls, this.wallsPath);
	};

	App.addOuterBox = function addOuterBox () {
		this.addBox({x: 10, y: 10}, {x: 190, y: 190});
	};

	App.addBox = function addBox(start, end) {
		this.walls.push(Shadows.CartesianLine({
			start: Shadows.CartesianPoint({
				x: start.x,
				y: start.y
			}),
			end: Shadows.CartesianPoint({
				x: end.x,
				y: start.y
			}),
		}));
		this.walls.push(Shadows.CartesianLine({
			start: Shadows.CartesianPoint({
				x: end.x,
				y: start.y
			}),
			end: Shadows.CartesianPoint({
				x: end.x,
				y: end.y
			}),
		}));
		this.walls.push(Shadows.CartesianLine({
			start: Shadows.CartesianPoint({
				x: end.x,
				y: end.y
			}),
			end: Shadows.CartesianPoint({
				x: start.x,
				y: end.y
			}),
		}));
		this.walls.push(Shadows.CartesianLine({
			start: Shadows.CartesianPoint({
				x: start.x,
				y: end.y
			}),
			end: Shadows.CartesianPoint({
				x: start.x,
				y: start.y
			}),
		}));
	};

	App.linesToPath = function linesToPath(lines, path) {
		path.strokeColor = 'black';

		for (var i = 0 ; i < lines.length ; i++) {
			var line = lines[i];

			var start = new _.Point(line.start.x, line.start.y);
			var end = new _.Point(line.end.x, line.end.y);

			path.moveTo(start);
			path.lineTo(end);
		}
	};

	return obj;
})(ShadowsApp || {}, paper);
