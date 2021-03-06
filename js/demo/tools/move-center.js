var ShadowsApp = (function defineShadowsApp(obj, _) {
	App = obj;
	Tools = App.Tools = App.Tools || {};
	Tool = Tools.MoveCenter = new _.Tool();

	App.paper = App.paper || {}
	App.paper.centerPath;

	Tool.init = function init() {
		var path = App.paper.centerPath = new _.Path.Circle({x: 50, y: 50}, 15);
		path.strokeColor = 'blue';
		path.fillColor = 'blue';
	};

	Tool.onMouseDown =
	Tool.onMouseDrag = function onMouseDrag(event) {
		App.compute(event.point);
	};

	return obj;
})(ShadowsApp || {}, paper);
