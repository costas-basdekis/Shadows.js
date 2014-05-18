var ShadowsApp = (function defineShadowsApp(obj, _) {
	App = obj;

	App.walls = Shadows.Walls();
	App.paper = App.paper || {}
	App.paper.wallsPath = null;

	App.createWalls = function createWalls() {
		this.addOuterBox();

		this.paper.wallsPath = new _.CompoundPath();
		this.linesToPath(this.walls.lines, this.paper.wallsPath);
	};

	App.addOuterBox = function addOuterBox () {
		this.walls.addBox([{x: 100, y: 100}, {x: 500, y: 500}]);
		this.walls.addBox([{x: 200, y: 200}, {x: 400, y: 400}]);
	};

	App.linesToPath = function linesToPath(lines, compoundPath) {
		compoundPath.strokeColor = 'black';

		var path, prevLine, newPath;
		for (var i = 0 ; i < lines.length ; i++) {
			var line = lines[i];

			var start = new _.Point(line.start.x, line.start.y);
			var end = new _.Point(line.end.x, line.end.y);

			if (!prevLine) {
				newPath = true;
			} else {
				if (!prevLine.end.equals([line.start])) {
					newPath = true;
				}
			}

			if (newPath) {
				path = new _.Path();
				compoundPath.children.push(path);
				path.moveTo(start);
			}
			path.lineTo(end);
		}
	};

	return obj;
})(ShadowsApp || {}, paper);
