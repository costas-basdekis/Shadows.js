var ShadowsApp = (function defineShadowsApp(obj, _) {
	App = obj;
	Tools = App.Tools = App.Tools || {};
	Tool = Tools.MoveCenter = new _.Tool();

	App.paper = App.paper || {}
	App.paper.centerPath;

	Tool.computeSections = null;
	Tool.center = Shadows.CartesianPoint();
	Tool.fps = {
		sum: 0,
		samples: [],
		maxSampleCount: 100,
	};

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
		var computeSections = this.computeSections;
		console.clear();
		var muteLogger = document.getElementById('muteLogger').checked;
		computeSections.logger.toggle([muteLogger]);
		var fpsSample = new Date;
		computeSections.compute({
			center: this.center,			
		});
		fpsSample = (new Date) - fpsSample;
		this.updateFPS(fpsSample / 1000);
		App.updateShadows(computeSections.sections);
	};

	Tool.updateFPS = function updateFPS(sample) {
		var fps = this.fps;
		if (typeof sample !== "undefined") {
			fps.samples.push(sample);
			fps.sum += sample;
			while (fps.samples.length >= fps.maxSampleCount) {
				fps.sum -= fps.samples.shift();
			}
		}
		var label = "";

		if (fps.samples.length) {
			label = Math.round(fps.samples.length / fps.sum);
		}

		document.getElementById('fps').innerText = label;
	};

	return obj;
})(ShadowsApp || {}, paper);
