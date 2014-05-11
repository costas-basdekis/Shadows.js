var Shadows = (function defineSectionsCompute(obj) {
	var Sections = Shadows.Sections = Shadows.Sections || {};
	var Compute = Sections.Compute = CLASS('Shadows.Sections.Compute', {
		__init__: METHOD(DEF(
			['self', 'lines'],
			function __init__(self, lines) {
				self.__super__({name: '__init__'})();

				self.lines = lines;
				self.logger = Logger({tab: '  '});
				self.newSections = [];
				self.sectionsReserve = [];
				self.sections = Shadows.Sections.Sections({
					logger: self.logger,
				});
			})),
		compute: METHOD(DEF(
			['self', {n: 'center', is: ['Shadows.CartesianPoint']}],
			function compute(self, center) {
				self.start([center]);
				while (self.hasSteps()) {
					self.step();
				}
				return self.finish();
			})),
		start: METHOD(DEF(
			['self', {n: 'center', is: ['Shadows.CartesianPoint']}],
			function start(self, center) {
				self.center = center;
				self.sectionsReserve = self.sectionsReserve.concat(self.newSections);
				self.newSections = [];

				self.index = 0;

				self.logger.reset();
				self.logger.log(['Compute at %s', self.center]);
				self.logger.indent();

				self.linesToSections();
				self.sortSections();

				self.sections.center = center;
				self.sections.clear();

				return self.index;
			})),
		step: METHOD(DEF(
			['self'],
			function step(self) {
				self.logger.setIndent([1])

				var section = self.newSections[self.index];
				self.insertSection([section]);

				self.index += 1;

				return self.index;
			})),
		hasSteps: METHOD(DEF(
			['self'],
			function hasSteps (self) {
				return self.index < self.newSections.length;
			})),
		finish: METHOD(DEF(
			['self'],
			function finish(self) {
				self.logger.setIndent([1])
				self.logger.log(['Finish']);
				self.logger.reset();

				return self.newSections.length;
			})),
		linesToSections: METHOD(DEF(
			['self'],
			function linesToSections(self) {
				var cl = Shadows.CartesianLine(), pl;

				for (var i = 0, line ; line = self.lines[i] ; i++) {
					cl.copyFrom([line]);
					cl.minus([self.center]);
					if (self.sectionsReserve.length) {
						pl = self.sectionsReserve.pop();
					} else {
						pl = Shadows.PolarLine();
					}
					pl.fromCartesian([cl]);
					self.newSections.push(pl);
				}
			})),
		sortKey: STATICMETHOD(DEF(
			[{n: 'line', is: ['Shadows.PolarLine']}],
			function sortKey(line) {
				return Math.min(line.start.distance, line.end.distance);
			})),
		sortFunction: function sortFunction(lhs, rhs) {
				var sortKey = Shadows.Sections.Compute.__class_def__.sortKey;
			 	var lKey = sortKey([lhs]);
			 	var rKey = sortKey([rhs]);

			 	if (lKey < rKey) {
			 		return -1;
			 	} else if (lKey > rKey) {
			 		return 1;
			 	} else {
			 		return 0;
			 	}
			 },
		sortSections: METHOD(DEF(
			['self'],
			function sortSections(self) {
				self.newSections = self.newSections.sort(self.sortFunction);
			})),
		insertSection: METHOD(DEF(
			['self', {n:'section', is: ['Shadows.PolarLine']}],
			function insertSection(self, section) {
				self.logger.log(['Insert %s: %s', self.index, section]);
				self.logger.indent();

				if (section.isEmpty()) {
					self.logger.log(['Empty section - ignore']);
				} else if (section.isOnPoint()) {
					self.logger.log(['On top of point - ignore']);
				} else {
					self.sections.insert([section]);
				}

				self.logger.dedent();
			})),
	});

	return obj;
})(Shadows || {});
