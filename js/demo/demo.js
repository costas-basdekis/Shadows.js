var ShadowsApp = (function defineShadowsApp(obj, _) {
	App = obj;

	App.init = function init() {
		this.initPaper();
		this.initWalls();
		this.redraw();
	};

	App.initPaper = function initPaper() {
		var canvas = document.getElementById('myCanvas');
		_.setup(canvas);
	};

	App.initWalls = function initWalls() {
		this.createWalls();
	};

	App.redraw = function redraw() {
		_.view.draw();
	};

	return obj;
})(ShadowsApp || {}, paper);
