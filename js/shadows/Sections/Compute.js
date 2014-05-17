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
					if (self.isVisible) {
						self.icShortenCommonSection();
						self.icInsertCommonSection();
					} else {
						self.logger.log(["Discard - it's hidden"]);
					}

					self.logger.dedent();
				} while (!self.icEndOfLoop())
				self.logger.dedent();

				assert(!self.headSection, "No head at the end of the loop");
				self.icInsertLastTail();
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
				if (self.icEndOfLoop) {
					return True;
				}

				self.conflictIndex = (self.conflictIndex + 1) % self.sections.sections.count;

				return False;
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
				} else {
					self.commonSection.start.copyFrom([self.headSection.start]);
					self.logger.log(["Join with head, now %s", self.commonSection]);
				}

				self.headSection = null;
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
						self.tailSection = self.commonSection.__deepcopy__();
					}
				} else if (conflictSection.containsSection([commonSection])) {
					self.logger.log(["Conflict contains common"]);

					//Conflict contains it - it gets split
					self.icInsertSplit([commonSection, self.conflictIndex]);
				} else {
					//Covers only the start or the end of the section
					if (self.conflictSection.containsAngle([self.commonSection.end.angle])) {
						//Shorten section
						self.conflictSection.start.interpolateLine([
							self.conflictSection, self.commonSection.end.angle]);
						self.logger.log(["Shorten start of %s: now %s", self.conflictIndex, self.conflictSection]);
						self.logger.log(["Common before conflict"]);
						//Add before
						self.icInsertBefore([self.commonSection, self.conflictIndex]);
					} else {
						assert(self.conflictSection.containsAngleInclusive([self.commonSection.start.angle]),
							"Common covers only the start or the end of the conflict");
						//Shorten Section
						self.conflictSection.end.interpolateLine([
							self.conflictSection, self.commonSection.start.angle]);
						self.logger.log(["Shorten end of %s: now %s", self.conflictIndex, self.conflictSection]);
						//Append to tail
						if (self.tailSection) {
							self.tailSection.start.copyFrom([self.commonSection.start]);
						} else {
							self.tailSection = self.commonSection.__deepcopy__();
						}
						self.logger.log(["Common after conflict"]);
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
			},
		//Sections management
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
				self.conflictSection = self.sections.sections[self.conflictIndex];
				self.logNewIntersect();

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
				self.conflictSection = self.sections.sections[self.conflictIndex];
				self.logNewIntersect();

				self.logger.dedent();
			}),
		icInsertSplit: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}, 'index'],
			function icInsertSplit(self, section, index) {
				self.logger.indent();

				assert(self.isEndOfLoop, "InsertSplit only on end of loop");

				self.logger.log(["Insert & split %s: %s", index, section]);

				//First split
				var splitSection = self.sections[index];
				var secondPart = Shadows.PolarLine({
					start: self.compareSection.end.__copy__(),
					end: splitSection.end.__copy__(),
				});

				//Then shorten
				splitSection.end.copyFrom([self.compareSection.start]);

				//Add second part
				self.icInsertAfter([secondPart, index]);

				//Finaly, add section
				self.icInsertAfter([section, index]);

				self.logger.dedent();
			}),
		icRemoveSection:
			function icRemoveSection(self, index) {
				self.logger.indent();

				var section = self.sections.sections[index];
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
				self.conflictSection = self.sections.sections[self.conflictIndex];
				self.logNewIntersect();

				self.logger.dedent();
			},
	});

	return obj;
})(Shadows || {});
