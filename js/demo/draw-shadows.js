var ShadowsApp = (function defineShadowsApp(obj, _) {
	App = obj;

	App.paper = App.paper || {}
	App.paper.shadowsPath = null;

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

		var logger = shadows.logger;

		var cSection = Shadows.CartesianLine(), prevCSection;
		var start, end, thisStart, center = new _.Point(shadows.center.x, shadows.center.y);
		for (var i = 0 ; i < shadows.sections.length ; i++) {
			var section = shadows.sections[i];

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
				if (cSection.start.equals([prevCSection.end])) {
					logger.log(['Connects with end']);
					path.moveTo(start);
				} else {
					path.moveTo(center);
					path.lineTo(start);
				}
				path.lineTo(end);
			} else {
				if (cSection.start.equals([prevCSection.end])) {
					logger.log(['Continue to %s', cSection.end]);

					end = new _.Point(cSection.end.x, cSection.end.y);
					path.lineTo(end);
				} else {
					logger.log(['New batch %s', cSection]);

					start = new _.Point(cSection.start.x, cSection.start.y);
					end = new _.Point(cSection.end.x, cSection.end.y);

					path.lineTo(center);
					path.lineTo(start);
					path.lineTo(end);
				}
			}
		}
	};

	return obj;
})(ShadowsApp || {}, paper);
