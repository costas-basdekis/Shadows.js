var ShadowsApp = (function defineShadowsApp(obj, _) {
	App = obj;
	App.paper = App.paper || {};

	App.computeSections = null;
	App.center = Shadows.CartesianPoint();

	App.computeFPS = new FPSCounter({element: 'computeFPS'});
	App.drawFPS = new FPSCounter({element: 'drawFPS'});
	App.totalFPS = new FPSCounter({element: 'totalFPS'});

	App.init = function init() {
		this.initPaper();
		this.initWalls();
		this.initShadows();
		this.initCompute();
		this.initMouse()
		this.redraw();
		this.stepByStep.init();

		document.getElementById('muteLogger').onclick = this.muteLogger_onclick;
		document.getElementById('debugDrawing').onclick = this.debugDrawing_onclick;
		document.getElementById('presets').onclick = this.presets_onchange;
	};

	App.muteLogger_onclick = function muteLogger_onclick() {
		var muteLogger = this.checked;
		App.computeSections.logger.toggle([muteLogger]);
	};

	App.debugDrawing_onclick = function debugDrawing_onclick() {
		var debugDrawing = this.checked;
		App.debugDrawing = debugDrawing;
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

	App.initCompute = function initCompute() {
		var computeSections = App.computeSections = Shadows.Sections.Compute({
			lines: App.walls.lines,
		});
		Shadows.PolarLine.__class_def__.toStringCenter = computeSections.center;
	};

	App.initMouse = function initMouse() {
		this.Tools.MoveCenter.init();
	};

	App.redraw = function redraw() {
		_.view.draw();
	};

	App.presets_onchange = function presets_onchange() {
		var listBox = document.getElementById('presets');
		var selectedIndex = listBox.selectedIndex;
		var selectedOption = listBox.options[selectedIndex];
		if (!selectedOption) {
			return;
		}
		var x = parseInt(selectedOption.attributes.getNamedItem('data-x').value);
		var y = parseInt(selectedOption.attributes.getNamedItem('data-y').value);

		App.compute({x: x, y: y});
	}

	App.compute = function compute(center) {
		App.center.set({x: center.x, y: center.y});

		var path = App.paper.centerPath;
		path.position = center;

		App.totalFPS.start();

		App.computeFPS.start();
		App.computeSections.compute({
			center: App.center,			
		});
		App.computeFPS.end();

		App.drawFPS.start();
		App.updateShadows(App.computeSections.sections);
		App.drawFPS.end();

		App.totalFPS.end();

		document.getElementById('pythonOverhead').innerText = PythonMetrics.overheadPerCent();
	};

	return obj;
})(ShadowsApp || {}, paper);
