var Shadows = (function defineSectionsCompute(obj) {
	var Sections = Shadows.Sections = Shadows.Sections || {};
	var Compute = Sections.Compute = CLASS('Shadows.Sections.Compute', {
		__init__: 
			function __init__(self, lines) {
				self.__super__({name: '__init__'})();

				self.lines = lines;
				self.logger = Logger({tab: '  '});
				self.newSections = Shadows.NewSections();
				self.sections = Shadows.Sections.Sections({
					logger: self.logger,
				});
			},
		compute: DEF(
			['self', {n: 'center', is: ['Shadows.CartesianPoint']}],
			function compute(self, center) {
				self.start([center]);
				while (self.hasSteps()) {
					self.step();
				}
				return self.finish();
			}),
		start: DEF(
			['self', {n: 'center', is: ['Shadows.CartesianPoint']}],
			function start(self, center) {
				self.center = center;

				self.index = 0;

				self.logger.reset();
				self.logger.log(['Compute at %s', self.center]);
				self.logger.indent();

				self.newSections.fromLines([self.lines, self.center]);
				self.newSections.sort();

				self.sections.center = center;
				self.sections.clear();

				return self.index;
			}),
		step: 
			function step(self) {
				self.logger.setIndent([1])

				var section = self.newSections.sections[self.index];
				self.insertSection([section]);

				self.index += 1;

				return self.index;
			},
		hasSteps: 
			function hasSteps (self) {
				return self.index < self.newSections.sections.length;
			},
		finish: 
			function finish(self) {
				self.logger.setIndent([1])
				self.logger.log(['Finish']);
				self.logger.reset();

				return self.newSections.sections.length;
			},
		insertSection: DEF(
			['self', {n:'section', is: ['Shadows.PolarLine']}],
			function insertSection(self, section) {
				self.logger.log(['Insert %s: %s', self.index, section]);
				self.logger.indent();

				if (section.isEmpty()) {
					self.logger.log(['Empty section - ignore']);
				} else if (section.isOnPoint()) {
					self.logger.log(['On top of point - ignore']);
				} else {
					var intersects = self.sections.intersects([section]);

					self.logger.log(["Intersects: %s", intersects]);
					if (intersects) {
						self.insertConflicts([section]);
					} else {
						self.sections.insertNoConflicts([section]);
					}
				}

				self.logger.dedent();
			}),
		insert: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function insert(self, section) {
			}),
		insertConflicts: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function insertConflicts(self, section) {

			}),
	});

	return obj;
})(Shadows || {});
