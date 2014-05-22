var ShadowsApp = (function defineShadowsApp(obj, _) {
	App = obj;

	App.paper = App.paper || {}
	App.paper.shadowsPath = null;
	App.debugDrawing = true;

	App.createShadows = function createShadows() {
		this.paper.shadowsPath = new _.Path();
	}

	App.updateShadows = function updateShadows(shadows) {
		this.shadowsToPath(shadows, this.paper.shadowsPath);
	}

	App.shadowsToPath = function shadowsToPath(shadows, path) {
		path.strokeColor = 'yellow';
		path.fillColor = 'red';

		path.removeSegments();

		if (shadows.sections.length == 0) {
			_.view.draw();
			return;
		}

		var logger = shadows.logger;

		var section = shadows.getSectionWrapped([-1]), prevSection;
		var cSection = Shadows.CartesianLine(), prevCSection;
		var start, end, thisStart, center = new _.Point(shadows.center.x, shadows.center.y);
		for (var i = 0 ; i < shadows.sections.length ; i++) {
			prevSection = section;
			section = shadows.sections[i];

			prevCSection = cSection;
			cSection = section.toCartesian();
			cSection.plus([shadows.center]);

			if (!start) {
				start = new _.Point(cSection.start.x, cSection.start.y);
				end = new _.Point(cSection.end.x, cSection.end.y);

				logger.log(['First segment: %s', cSection]);

				prevCSection = shadows.sections[shadows.sections.length - 1]
					.toCartesian()
					.plus([shadows.center]);
				logger.log(['Prev and this %s %s', prevCSection, cSection]);
				if (!this.debugDrawing && Shadows.Math.CIEq([section.start.angle, prevSection.end.angle])) {
					logger.log(['Connects with end']);
					path.moveTo(start);
				} else {
					path.moveTo(center);
					path.lineTo(start);
				}
				path.lineTo(end);
			} else {
				if (!this.debugDrawing &&
					Shadows.Math.CIEq([section.start.angle, prevSection.end.angle])) {
					logger.log(['Continue to %s', cSection.end]);
				} else {
					logger.log(['New batch %s', cSection]);
					path.lineTo(center);
				}

				start = new _.Point(cSection.start.x, cSection.start.y);
				end = new _.Point(cSection.end.x, cSection.end.y);
				path.lineTo(start);
				path.lineTo(end);
			}
		}

		_.view.draw();
	};

	return obj;
})(ShadowsApp || {}, paper);
