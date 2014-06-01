var ShadowsApp = (function defineShadowsApp(obj, _) {
	App = obj;

	App.walls = Shadows.Walls();
	App.paper = App.paper || {}
	App.paper.wallsPath = null;

	App.createWalls = function createWalls() {
		var selected = App.createWalls.Maze;

		var roomsElement = document.getElementById('rooms');

		for (var i = 0, room ; room = App.createWalls.rooms[i] ; i++) {
			var optionHTML = "<option value='%s'>%s</option>".interpolate(room.name, room.name);
			var optionElement = document.createElement('option');
			roomsElement.appendChild(optionElement);
			optionElement.outerHTML = optionHTML;
		}
		roomsElement.value = selected.name;
		roomsElement.onchange = App.createWalls.rooms_onclick;

		this.createWalls.useRoom(selected.name);
	};

	App.createWalls.rooms_onclick = function rooms_onclick() {
		var selected = this.value;
		App.createWalls.useRoom(selected);
		App.compute(App.center);
	};

	App.createWalls.useRoom = function useRoom(room) {
		if (App.paper.wallsPath) {
			App.paper.wallsPath.remove();
		}
		App.paper.wallsPath = new _.CompoundPath();
		App.walls.clear();
		App.createWalls[room]();
		App.linesToPath(App.walls.lines, App.paper.wallsPath);
		if (App.computeSections) {
			App.computeSections.lines = App.walls.lines;
		}
	}

	App.createWalls.TwoBoxes = function TwoBoxes() {
		App.createWalls.addOuterBox();
		App.walls.addBox([{x: 200, y: 200}, {x: 300, y: 300}]);
	};

	App.createWalls.FiveBoxes = function FiveBoxes() {
		App.createWalls.addOuterBox();
		var interval = 200, size = interval / 5;
		for (var x = 100 + size ; (x + size) < 550 ; x += interval) {
			for (var y = 100 + size ; (y + size) < 550 ; y += interval) {
				App.walls.addBox([{x: x, y: y}, {x: x + size, y: y + size}]);
			}
		}
	};

	App.createWalls.Maze = function Maze() {
		App.createWalls.addOuterBox();
		App.walls.addLine({start: {x: 200, y: 200}, end: {x: 200, y: 300}})
		App.walls.addLine({start: {x: 150, y: 150}, end: {x: 350, y: 150}})
		App.walls.addLine({start: {x: 450, y: 150}, end: {x: 150, y: 450}})
		App.walls.addLine({start: {x: 300, y: 350}, end: {x: 450, y: 500}})
		App.walls.addLine({start: {x: 350, y: 300}, end: {x: 500, y: 450}})
		App.walls.addLine({start: {x: 375, y: 425}, end: {x: 275, y: 525}})
		// Buggy!
		//App.walls.addPolygon([{x: 450, y: 200}, {x: 400, y: 300}, {x: 500, y: 300}]);
	};

	App.createWalls.Shapes = function Shapes() {
		App.createWalls.addOuterBox();
		App.walls.addRegularPolygon({center: {x: 400, y: 400}, radius: 50, count: 3});
		App.walls.addRegularPolygon({center: {x: 200, y: 300}, radius: 50, count: 6});
		App.walls.addRegularPolygon({center: {x: 400, y: 200}, radius: 50, count: 5});
		App.walls.addStar({center: {x: 200, y: 500}, smallRadius: 35, bigRadius: 65, count: 7});
	};

	App.createWalls.MoreShapes = function MoreShapes() {
		App.createWalls.addOuterBox();
		for (var i = 0 ; i < 3 ; i++) {
			for (var j = 0 ; j < 3 ; j++) {
				var count = (i * 3 + j);
				var x = 100 + 500 / 3 * (j + 0.5);
				var y = 100 + 500 / 3 * (i + 0.5);
				switch (count % 2) {
				case 0:
					App.walls.addRegularPolygon({center: {x: x, y: y}, radius: 25, count: count % 4 + 3});
					break;
				case 1:
					App.walls.addStar({center: {x: x, y: y}, smallRadius: 15, bigRadius: 25, count: count % 4 + 5});
					break;
				}
			}
		}
	};

	App.createWalls.rooms = [
		App.createWalls.TwoBoxes,
		App.createWalls.FiveBoxes,
		App.createWalls.Maze,
		App.createWalls.Shapes,
		App.createWalls.MoreShapes,
	];

	App.createWalls.addOuterBox = function addOuterBox () {
		App.walls.addBox([{x: 100, y: 100}, {x: 600, y: 600}]);
	};

	App.linesToPath = function linesToPath(lines, compoundPath) {
		compoundPath.strokeColor = 'green';

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
