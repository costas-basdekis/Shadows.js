var Shadows = (function defineSectionsCompute(obj) {
	var PolarLine = Shadows.PolarLine;
	
	var Sections = Shadows.Sections = Shadows.Sections || {};
	var Compute = Sections.Compute = CLASS('Shadows.Sections.Compute', {
		__init__: 
			function __init__(self, lines) {
				self.__super__({name: '__init__'})();

				self.logger = Logger({tab: '  '});
				self.metrics = Metrics();
				self.newSections = Shadows.Sections.NewSections();
				self.sections = Shadows.Sections.Sections({
					logger: self.logger,
					metrics: self.metrics,
				});
				self.center = Shadows.CartesianPoint();

				self.setLines([lines]);
			},
		getSection:
			function getSection(self, index) {
				return self.sections.getSection([index]);
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
		setLines:
			function setLines(self, lines) {
				self.lines = lines;
			},
		start: DEF(
			['self', {n: 'center', is: ['Shadows.CartesianPoint']}],
			function start(self, center) {
				self.center.copyFrom([center]);

				self.index = 0;

				self.logger.reset();
				self.logger.begin();
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
				self.logger.step();
				self.logger.setIndent([1])

				var section = self.newSections.sections[self.index];
				var success = False;
				try {
					self.insertSection([section]);
					success = True;
				} finally {
					if (!success) {
						self.logger.error(["Errored @%s", self.center]);
						console.error("Errored @%s".interpolate(self.center));
					}
				}

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
				self.logger.end();

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
					self.metrics.start(['ComputeStep']);
					self.metrics.start(['ComputeStep.intersects']);
					var intersects = self.sections.intersects([section]);
					self.metrics.end(['ComputeStep.intersects']);

					self.logger.log(["Intersects: %s", intersects]);
					if (intersects) {
						self.metrics.start(['ComputeStep.insertConflicts']);
						self.insertConflicts([section]);
						self.metrics.end(['ComputeStep.insertConflicts']);
					} else {
						self.metrics.start(['ComputeStep.insertNoConflicts']);
						self.sections.insertNoConflicts([section]);
						self.metrics.end(['ComputeStep.insertNoConflicts']);
					}
					self.metrics.end(['ComputeStep']);
				}

				self.logger.dedent();
			}),
		insertConflicts: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function insertConflicts(self, section) {
				self.metrics.start(['ComputeStep.insertConflicts.getIntersectionsBoundaries']);
				self.firstConflict = self.sections.getFirstInterSection([section]);
				self.lastConflict = self.sections.getLastInterSection({
					section: section,
					firstInterSection: self.firstConflict,
				});
				self.metrics.end(['ComputeStep.insertConflicts.getIntersectionsBoundaries']);
				self.logger.log(["Intersect %s-%s", self.firstConflict, self.lastConflict]);

				self.metrics.start(['ComputeStep.insertConflicts.MakeSections']);
				self.headSection = null;
				self.commonSection = PolarLine.__make__();
				self.compareSection = PolarLine.__make__();
				self.tailSection = PolarLine.__make__().copyFrom([section]);
				self.metrics.end(['ComputeStep.insertConflicts.MakeSections']);


				self.conflictIndex = self.firstConflict;
				self.logger.indent();
				self.metrics.start(['ComputeStep.insertConflicts.Loop']);
				do {
					self.metrics.start(['ComputeStep.insertConflicts.Loop.icStartOfLoop']);
					self.icStartOfLoop();
					self.metrics.end(['ComputeStep.insertConflicts.Loop.icStartOfLoop']);

					self.logger.indent();

					self.metrics.start(['ComputeStep.insertConflicts.Loop.icSplitInHCT']);
					self.icSplitInHCT();
					self.metrics.end(['ComputeStep.insertConflicts.Loop.icSplitInHCT']);
					self.metrics.start(['ComputeStep.insertConflicts.Loop.icDetermineVisibility']);
					self.icDetermineVisibility();
					self.metrics.end(['ComputeStep.insertConflicts.Loop.icDetermineVisibility']);
					self.metrics.start(['ComputeStep.insertConflicts.Loop.icDealWithHead']);
					self.icDealWithHead();
					self.metrics.end(['ComputeStep.insertConflicts.Loop.icDealWithHead']);
					if (self.isVisible) {
						self.metrics.start(['ComputeStep.insertConflicts.Loop.icShortenCommonSection']);
						self.icShortenCommonSection();
						self.metrics.end(['ComputeStep.insertConflicts.Loop.icShortenCommonSection']);
						self.metrics.start(['ComputeStep.insertConflicts.Loop.icInsertCommonSection']);
						self.icInsertCommonSection();
						self.metrics.end(['ComputeStep.insertConflicts.Loop.icInsertCommonSection']);
					} else {
						self.logger.log(["Discard - it's hidden"]);
					}

					self.logger.dedent();
				} while (!self.icEndOfLoop())
				self.metrics.end(['ComputeStep.insertConflicts.Loop']);
				self.logger.dedent();

				assert(!self.headSection, "No head at the end of the loop");
				self.metrics.start(['ComputeStep.insertConflicts.icInsertLastTail']);
				self.icInsertLastTail();
				self.metrics.end(['ComputeStep.insertConflicts.icInsertLastTail']);

				self.metrics.start(['ComputeStep.insertConflicts.TakeSections']);
				self.headSection = PolarLine.__take__([self.headSection]);
				self.compareSection = PolarLine.__take__([self.compareSection]);
				self.commonSection = PolarLine.__take__([self.commonSection]);
				self.tailSection = PolarLine.__take__([self.tailSection]);
				self.metrics.end(['ComputeStep.insertConflicts.TakeSections']);
			}),
		icStartOfLoop: 
			function icStartOfLoop(self) {
				self.isEndOfLoop = self.conflictIndex == self.lastConflict;
				self.logger.log(["End of loop: %s", self.isEndOfLoop]);

				self.logger.log(["Tail %s", self.tailSection]);
				self.conflictSection = self.getSection([self.conflictIndex]);
				self.logger.log(["For #%s: %s", self.conflictIndex, self.conflictSection]);
			},
		icEndOfLoop:
			function icEndOfLoop(self) {
				if (self.isEndOfLoop) {
					return True;
				}

				self.conflictIndex = self.sections.wrapIndex([self.conflictIndex + 1]);

				return False;
			},
		icSplitInHCT:
			function icSplitInHCT(self) {
				assert(!self.headSection, "Head section exists before splitting in HCT");

				if (!self.tailSection) {
					return;
				}

				self.metrics.start(['ComputeStep.insertConflicts.Loop.icSplitInHCT.limitCommon']);
				self.commonSection.copyFrom([self.tailSection]);
				self.commonSection.limitToAngles([self.conflictSection]);
				self.metrics.end(['ComputeStep.insertConflicts.Loop.icSplitInHCT.limitCommon']);
				self.metrics.start(['ComputeStep.insertConflicts.Loop.icSplitInHCT.atAnglesCompare']);
				self.compareSection.copyFrom([self.conflictSection]);
				self.compareSection.atAngles([self.commonSection]);
				self.metrics.end(['ComputeStep.insertConflicts.Loop.icSplitInHCT.atAnglesCompare']);

				var headStart = self.tailSection.start, headEnd = self.commonSection.start;
				self.metrics.start(['ComputeStep.insertConflicts.Loop.icSplitInHCT.MakeHead']);
				if (!headStart.sameAngle([headEnd])) {
					self.headSection = PolarLine.__make__();
					self.headSection.start.copyFrom([headStart]);
					self.headSection.end.copyFrom([headEnd]);
				}
				self.metrics.end(['ComputeStep.insertConflicts.Loop.icSplitInHCT.MakeHead']);

				self.metrics.start(['ComputeStep.insertConflicts.Loop.icSplitInHCT.MakeTail']);
				self.tailSection.start.copyFrom([self.commonSection.end]);
				if (self.tailSection.isEmpty()) {
					self.tailSection = PolarLine.__take__([self.tailSection]);
				}
				self.metrics.end(['ComputeStep.insertConflicts.Loop.icSplitInHCT.MakeTail']);

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
				self.isVisible = self.startIsVisible || self.endIsVisible;

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
					self.icInsertBefore([self.headSection, self.conflictIndex]);
					self.headSection = null;
				} else {
					self.commonSection.start.copyFrom([self.headSection.start]);
					self.logger.log(["Join with head, now %s", self.commonSection]);
					self.headSection = PolarLine.__take__([self.headSection]);
				}
			},
		icShortenCommonSection:
			function icShortenCommonSection(self) {
				if (self.startIsVisible && self.endIsVisible) {
					return;
				}

				var commonPoint = self.commonSection.intersect([self.conflictSection]);

				if (!self.startIsVisible) {
					self.commonSection.start.copyFrom([commonPoint]);
				} else {
					self.commonSection.end.copyFrom([commonPoint]);
				}
				self.logger.log(["Shorten common, now: %s", self.commonSection]);
			},
		icInsertCommonSection:
			function icInsertCommonSection(self) {
				var commonSection = self.commonSection;
				var conflictSection = self.conflictSection;

				if (commonSection.isEmpty()) {
					self.logger.log(["Too small - discard"]);
				} else if (commonSection.containsSectionInclusive([conflictSection])) {
					self.logger.log(["Common contains conflict"]);

					//It contains the section - remove it
					self.icRemoveSection([self.conflictIndex]);
					//Everything is tail now
					if (self.tailSection) {
						self.tailSection.start.copyFrom([self.commonSection.start]);
					} else {
						self.tailSection = PolarLine.__make__().copyFrom([self.commonSection]);
					}
				} else if (conflictSection.containsSection([commonSection])) {
					self.logger.log(["Conflict contains common"]);

					//Conflict contains it - it gets split
					self.icInsertSplit([commonSection, self.conflictIndex]);
					commonSection = self.commonSection = null;
				} else {
					//Covers only the start or the end of the section
					if (self.conflictSection.containsAngle([commonSection.end.angle])) {
						//Shorten section
						self.conflictSection.start.interpolateLine([
							self.conflictSection, commonSection.end.angle]);
						self.logger.log(["Shorten start of %s: now %s", self.conflictIndex, self.conflictSection]);
						self.logger.log(["Common before conflict"]);
						//Add before
						self.icInsertBefore([commonSection, self.conflictIndex]);
						commonSection = self.commonSection = null;
					} else {
						assert(self.conflictSection.containsAngleInclusive([commonSection.start.angle]),
							"Common covers only the start or the end of the conflict");
						//Shorten Section
						self.conflictSection.end.interpolateLine([
							self.conflictSection, commonSection.start.angle]);
						self.logger.log(["Shorten end of %s: now %s", self.conflictIndex, self.conflictSection]);
						//Append to tail
						if (self.tailSection) {
							self.tailSection.start.copyFrom([commonSection.start]);
						} else {
							self.tailSection = PolarLine.__make__().copyFrom([self.commonSection]);
						}
						self.logger.log(["Common after conflict - append to tail"]);
					}
				}
			},
		icInsertLastTail:
			function icInsertLastTail(self) {
				if (!self.tailSection) {
					return;
				}

				self.logger.log(["Final tail %s, insert at end", self.tailSection]);
				self.icInsertAfter([self.tailSection, self.conflictIndex]);
				self.tailSection = null;
			},
		//Sections management
		icPostAlterSections:
			function icPostAlterSections(self) {
				if (self.conflictIndex >= self.firstConflict) {
					self.conflictSection = self.getSection([self.conflictIndex]);
				}
				else {
					self.conflictSection = null;
				}
				self.logNewIntersect();
			},
		logNewIntersect:
			function logNewIntersect(self) {
				self.logger.log(["New intersect: %s,%s @%s",
					self.firstConflict, self.lastConflict, self.conflictIndex]);
			},
		icInsertBefore: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}, 'index'],
			function icInsertBefore(self, section, index) {
				self.logger.indent();

				self.logger.log(["Add before %s: %s", index, section]);
				self.sections._insertBefore({section: section, index: index});

				if (self.firstConflict >= index) {
					self.firstConflict++;
				}
				if (self.lastConflict >= index) {
					self.lastConflict++;
				}
				if (self.conflictIndex >= index) {
					self.conflictIndex++;
				}

				self.icPostAlterSections();

				self.logger.dedent();
			}),
		icInsertAfter: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}, 'index'],
			function icInsertAfter(self, section, index) {
				self.logger.indent();

				self.logger.log(["Add after %s: %s", self.conflictIndex, section]);
				self.sections._insertAfter({section: section, index: index});

				if (self.firstConflict > index) {
					self.firstConflict++;
				}
				if (self.lastConflict > index) {
					self.lastConflict++;
				}
				if (self.conflictIndex > index) {
					self.conflictIndex++;
				}

				self.icPostAlterSections();

				self.logger.dedent();
			}),
		icInsertSplit: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}, 'index'],
			function icInsertSplit(self, section, index) {
				self.logger.indent();

				assert(self.isEndOfLoop, "InsertSplit only on end of loop");

				self.logger.log(["Insert & split %s: %s", index, section]);

				//First split
				var splitSection = self.getSection([index]);
				var secondPart = PolarLine.__make__();
				secondPart.start.copyFrom([self.compareSection.end]);
				secondPart.end.copyFrom([splitSection.end]);

				//Then shorten
				splitSection.end.copyFrom([self.compareSection.start]);

				//Add second part
				self.icInsertAfter([secondPart, index]);

				self.icPostAlterSections();

				//Finaly, add section
				self.icInsertAfter([section, index]);

				self.icPostAlterSections();

				self.logger.dedent();
			}),
		icRemoveSection:
			function icRemoveSection(self, index) {
				self.logger.indent();

				var section = self.getSection([index]);
				self.logger.log(["Remove section %s: %s", index, section]);
				self.sections._remove([index]);

				//Only decrement later ones
				//Note the difference in the ineq signs
				if (self.firstConflict > index) {
					self.firstConflict--;
				}
				if (self.lastConflict >= index) {
					self.lastConflict--;
				}
				if (self.conflictIndex >= index) {
					self.conflictIndex--;
				}

				self.icPostAlterSections();

				self.logger.dedent();
			},
	});

	return obj;
})(Shadows || {});
