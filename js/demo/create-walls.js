var ShadowsApp = (function defineShadowsApp(obj, _) {
	App = obj;

	App.walls = Shadows.Walls();
	App.paper = App.paper || {}
	App.paper.wallsPath = null;

	App.createWalls = function createWalls() {
		this.addOuterBox();

		this.paper.wallsPath = new _.Path();
		this.linesToPath(this.walls.lines, this.paper.wallsPath);
	};

	App.addOuterBox = function addOuterBox () {
		this.walls.addBox([{x: 10, y: 10}, {x: 590, y: 590}]);
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
