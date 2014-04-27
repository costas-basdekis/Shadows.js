var ShadowsApp = (function defineShadowsApp(obj, _) {
	App = obj;
	Tools = App.Tools = App.Tools || {};
	Tool = Tools.MoveCenter = new _.Tool();

	App.paper = App.paper || {}
	App.paper.centerPath;

	Tool.computeSections = null;
	Tool.center = Shadows.CartesianPoint();

	Tool.init = function init() {
		var path = App.paper.centerPath = new _.Path.Circle({x: 50, y: 50}, 15);
		path.strokeColor = 'black';
		path.fillColor = 'black';
	};

	Tool.onMouseDown =
	Tool.onMouseDrag = function onMouseDrag(event) {
		var path = App.paper.centerPath;
		path.position = event.point;
		this.center.set({
			x: event.point.x,
			y: event.point.y,
		});
		var computeSections = this.computeSections = Shadows.Sections.Compute({
			lines: App.walls,
			center: this.center,
		});
		computeSections.start();
		while (computeSections.hasSteps()) {
			computeSections.step();
		}
		computeSections.finish();
	};

	return obj;
})(ShadowsApp || {}, paper);
