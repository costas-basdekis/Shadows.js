var ShadowsApp = (function defineShadowsApp(obj, _) {
	App = obj;
	App.paper = App.paper || {};

	App.init = function init() {
		this.initPaper();
		this.initWalls();
		this.initShadows();
		this.initMouse()
		this.redraw();
	};

	App.initPaper = function initPaper() {
		var canvas = document.getElementById('myCanvas');
		_.setup(canvas);
	};

	App.initWalls = function initWalls() {
		this.createWalls();
	};

	App.initShadows = function initShadows() {
		this.createShadows();
	}

	App.initMouse = function initMouse() {
		this.Tools.MoveCenter.init();
	};

	App.redraw = function redraw() {
		_.view.draw();
	};

	return obj;
})(ShadowsApp || {}, paper);
