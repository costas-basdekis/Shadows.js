var ShadowsApp = (function defineShadowsApp(obj, _) {
	App = obj;
	Tools = App.Tools = App.Tools || {};
	Tool = Tools.MoveCenter = new _.Tool();

	App.paper = App.paper || {}
	App.paper.centerPath;

	Tool.computeSections = null;
	Tool.center = Shadows.CartesianPoint();
	Tool.computeFPS = new FPSCounter({element: 'computeFPS'});
	Tool.drawFPS = new FPSCounter({element: 'drawFPS'});
	Tool.totalFPS = new FPSCounter({element: 'totalFPS'});

	Tool.init = function init() {
		var path = App.paper.centerPath = new _.Path.Circle({x: 50, y: 50}, 15);
		path.strokeColor = 'black';
		path.fillColor = 'black';

		var computeSections = this.computeSections = Shadows.Sections.Compute({
			lines: App.walls,
		});
	};

	Tool.onMouseDown =
	Tool.onMouseDrag = function onMouseDrag(event) {
		var path = App.paper.centerPath;
		path.position = event.point;
		this.center.set({
			x: event.point.x,
			y: event.point.y,
		});

		var muteLogger = document.getElementById('muteLogger').checked;
		this.computeSections.logger.toggle([muteLogger]);
		if (!muteLogger) {
			console.clear();
		}

		var debugDrawing = document.getElementById('debugDrawing').checked;
		App.debugDrawing = debugDrawing;

		this.totalFPS.start();

		this.computeFPS.start();
		this.computeSections.compute({
			center: this.center,			
		});
		this.computeFPS.end();

		this.drawFPS.start();
		App.updateShadows(this.computeSections.sections);
		this.drawFPS.end();

		this.totalFPS.end();
	};

	return obj;
})(ShadowsApp || {}, paper);
