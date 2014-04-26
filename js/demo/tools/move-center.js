var ShadowsApp = (function defineShadowsApp(obj, _) {
	App = obj;
	Tools = App.Tools = App.Tools || {};
	Tool = Tools.MoveCenter = new _.Tool();

	App.paper = App.paper || {}
	App.paper.centerPath;

	Tool.init = function init() {
		var path = App.paper.centerPath = new _.Path.Circle({x: 50, y:50}, 15);
		path.strokeColor = 'black';
		path.fillColor = 'black';
	};

	Tool.onMouseDrag = function onMouseDrag(event) {
		var path = App.paper.centerPath;
		path.position = event.point;
	};

	return obj;
})(ShadowsApp || {}, paper);
