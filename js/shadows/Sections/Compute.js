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
				self.firstConflict = self.sections.getFirstInterSection([section]);
				self.lastConflict = self.sections.getLastInterSection({
					section: section,
					firstInterSection: self.firstConflict,
				});
				self.logger.log(["Intersect %s-%s", self.firstConflict, self.lastConflict]);

				self.headSection = null;
				self.commonSection = Shadows.PolarLine();
				self.compareSection = Shadows.PolarLine();
				self.tailSection = section.__deepcopy__();


				self.conflictIndex = self.firstConflict;
				self.logger.indent();
				do {
					self.icStartOfLoop();

					self.logger.indent();

					self.icSplitInHCT();
					self.icDetermineVisibility();
					self.icDealWithHead();

					self.logger.dedent();
				} while (!self.icEndOfLoop())
				self.logger.dedent();
			}),
		icStartOfLoop: 
			function icStartOfLoop(self) {
				self.isEndOfLoop = self.conflictIndex == self.lastConflict;

				self.logger.log(["Tail %s", self.tailSection]);
				self.conflictSection = self.sections.sections[self.conflictIndex];
				self.logger.log(["For #%s: %s", self.conflictIndex, self.conflictSection]);
			},
		icEndOfLoop:
			function icEndOfLoop(self) {
				return True;
			},
		icSplitInHCT:
			function icSplitInHCT(self) {
				assert(self.headSection == null, "Head section exists before splitting in HCT");
				assert(self.tailSection, "Tail section does not exist before splitting in HCT");

				self.commonSection.copyFrom([self.tailSection]);
				self.commonSection.limitToAngles([self.conflictSection]);
				self.compareSection.copyFrom([self.conflictSection]);
				self.compareSection.atAngles([self.commonSection]);

				var headStart = self.tailSection.start, headEnd = self.commonSection.start;
				if (!headStart.equals([headEnd])) {
					self.headSection = Shadows.PolarLine();
					self.headSection.start.copyFrom([headStart]);
					self.headSection.end.copyFrom([headEnd]);
				}

				self.tailSection.start.copyFrom([self.commonSection.end]);
				if (self.tailSection.isEmpty()) {
					self.tailSection = null;
				}

				if (self.headSection) {
					self.logger.log(["head %s", self.headSection]);
				}
				self.logger.log(["common %s", self.commonSection]);
				if (self.tailSection) {
					self.logger.log(["tail %s", self.tailSection]);
				}
			},
		icDetermineVisibility:
			function icDetermineVisibility(self) {
				var visibility = self.conflictSection.visibility([
					self.commonSection, self.compareSection]);

				self.startIsVisible = visibility.startIsVisible;
				self.endIsVisible = visibility.endIsVisible;

				self.logger.log(["compare to %s, visibility[%s,%s]", 
					self.compareSection, self.startIsVisible, self.endIsVisible]);
			},
		icDealWithHead:
			function icDealWithHead(self) {
				if (!self.headSection) {
					return;
				}

				if (!self.startIsVisible) {
					self.logger.log(["Insert head"]);
					self.icInsertBefore([self.headSection]);
				} else {
					self.commonSection.start.copyFrom([self.headSection.start]);
					self.logger.log(["Join with head, now %s", self.commonSection]);
				}

				self.headSection = null;
			},
		icInsertBefore: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function icInsertBefore(self, section) {
				self.logger.indent();

				self.logger.log(["Add before %s: %s", self.conflictIndex, section]);
				self.sections._insertBefore({section: section, index: self.conflictIndex});

				if (self.firstConflict >= index) {
					self.firstConflict++;
				}
				if (self.lastConflict >= index) {
					self.lastConflict++;
				}
				if (self.conflictIndex >= index) {
					self.conflictIndex++;
				}
				self.logger.log(["New intersect: %s-%s @%s",
					self.firstConflict, self.lastConflict, self.conflictIndex]);

				self.logger.dedent();
			}),
	});

	return obj;
})(Shadows || {});
