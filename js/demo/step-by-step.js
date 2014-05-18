var ShadowsApp = (function defineStepByStep(obj, _) {
	App = obj;

	var stepByStep = App.stepByStep = App.stepByStep || {};

	stepByStep.init = function init() {
		document.getElementById('stepStart').onclick = this.start;
		document.getElementById('stepStep').onclick = this.step;
		document.getElementById('stepEnd').onclick = this.end;
	};

	stepByStep.toggleStartButton = function toggleStartButton(toggle) {
		var el = document.getElementById('stepStart');

		el.disabled = !toggle;
	};

	stepByStep.toggleStepButton = function toggleStepButton(toggle) {
		var el = document.getElementById('stepStep');

		el.disabled = !toggle;
	};

	stepByStep.toggleEndButton = function toggleEndButton(toggle) {
		var el = document.getElementById('stepEnd');

		el.disabled = !toggle;
	};

	stepByStep.draw = function draw() {
		var computeSections = App.computeSections;

		App.updateShadows(computeSections.sections);
	};

	stepByStep.start = function start() {
		var computeSections = App.computeSections;
		if (!computeSections.center) {
			return;
		}

		computeSections.start({center: computeSections.center});
		stepByStep.draw();

		stepByStep.toggleStartButton(false);
		stepByStep.toggleStepButton(computeSections.hasSteps());
		stepByStep.toggleEndButton(true);
	};

	stepByStep.step = function step() {
		var computeSections = App.computeSections;

		computeSections.step();
		stepByStep.draw();

		stepByStep.toggleStepButton(computeSections.hasSteps());
		stepByStep.toggleEndButton(true);
	};

	stepByStep.end = function end() {
		var computeSections = App.computeSections;

		while (computeSections.hasSteps()) {
			computeSections.step();
		}
		computeSections.finish();
		stepByStep.draw();

		stepByStep.toggleStartButton(true);
		stepByStep.toggleStepButton(false);
		stepByStep.toggleEndButton(false);
	};

	return obj;
})(ShadowsApp || {}, paper);
