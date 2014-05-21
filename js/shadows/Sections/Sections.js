var Shadows = (function defineSectionsSections(obj, jsMath) {
	var Math = Shadows.Math, Polar = Math.Polar;
	var PolarLine = Shadows.PolarLine;

	var SectionsModule = Shadows.Sections = Shadows.Sections || {};
	var Sections = SectionsModule.Sections = CLASS('Shadows.Sections.Sections', {
		__init__: DEF(
			['self', {n: 'logger', is: ['utils.Logger']}],
			function __init__(self, logger) {
				self.sections = [];
				self.sectionsReserve = [];
				self.logger = logger;
			}),
		log: 
			function log(self) {
				for (var i = 0, section ; section = self.sections[i] ; i++) {
					self.logger.log(["%s %s", i + 1, section]);
				}
			},
		clear: 
			function clear(self) {
				self.sectionsReserve = self.sections.concat(self.sectionsReserve);
				self.sections = [];
			},
		getSection:
			function getSection(self, index) {
				var section = self.sections[index];

				if (!section) {
					throw ExceptionBase("Out of bounds index: %s".interpolate(index));
				}

				return section;
			},
		getSectionWrapped:
			function getSectionWrapped(self, index) {
				var wrappedIndex = index;

				if (wrappedIndex < 0) {
					wrappedIndex += self.sections.length;
				} else if (wrappedIndex >= self.sections.length) {
					wrappedIndex -= self.sections.length;
				}

				var section = self.getSection([wrappedIndex]);

				return section;
			},
		intersects: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function intersects(self, section) {
				var batchStart, batchEnd, batchSection = PolarLine();
				var batchStartSection, batchEndSection;

				batchStart = 0;
				while (batchStart < self.sections.length) {
					batchEnd = self.getBatchEnd([batchStart]);
					batchStartSection = self.sections[batchStart];
					batchEndSection = self.sections[batchEnd];
					if (batchStart == 0 &&
						batchEnd == (self.sections.length - 1) &&
						batchEndSection.isAdjacentTo([batchStartSection], {inOrder: True})) {
						return True;
					}

					batchSection.start.copyFrom([batchStartSection.start]);
					batchSection.end.copyFrom([batchEndSection.end]);
					if (section.intersects([batchSection])) {
						return True;
					}
					batchStart = batchEnd + 1;
				}

				return False;
			}),
		insertNoConflicts: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function insertNoConflicts(self, section) {
				if (self.sections.length == 0) {
					self.logger.log(["Insert first section"]);
					self._insertInitial([section]);
					return;
				}

				var batchStart, batchEnd;
				var batchStartSection, batchEndSection;

				batchStart = 0;
				batchEnd = 0;
				while (batchStart < self.sections.length) {
					batchStartSection = self.sections[batchStart];

					var prevSection = self.getSectionWrapped([batchStart - 1]);
					if (section.isBetween([prevSection, batchStartSection])) {
						self.logger.log(["Insert before batch @%s", batchStart]);
						self._insertBefore([section, batchStart]);
						return;
					}

					batchEnd = self.getBatchEnd([batchStart]);
					batchEndSection = self.sections[batchEnd];
					batchStart = batchEnd + 1;
				}

				var firstSection = self.getSectionWrapped([0]),
					lastSection = self.getSectionWrapped([-1]);

				if (section.isBetween([lastSection, firstSection])) {
					self.logger.log(["Insert in the end, after @%s", self.sections.length - 1]);
					self._insertLast([section]);
					return;
				}

				throw new ExceptionBase("insertNoConflicts did not insert @%s".interpolate(self.center));
			}),
		getBatchEnd: 
			function getBatchEnd(self, batchStart) {
				var prevSection = self.sections[batchStart];

				for (var i = batchStart + 1, section ; section = self.sections[i] ; i++) {
					if (!prevSection.isAdjacentTo([section], {inOrder: True})) {
						return i - 1;
					}
					prevSection = section;
				}

				return self.sections.length - 1;
			},
		getFirstInterSection: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function getFirstIntersection(self, section) {
				var thisAngleDiff, smallestAngleDiff = 0, sADSection = -1;

				for (var i = 0, candidate ; candidate = self.sections[i] ; i++) {
					if (candidate.containsAngleOrStart([section.start.angle])) {
						return i;
					}

					//Find the closest to the start
					thisAngleDiff = Polar.angleDiff([section.start.angle, candidate.start.angle]);
					if ((sADSection == -1) ||
						(thisAngleDiff < smallestAngleDiff)) {
						smallestAngleDiff = thisAngleDiff;
						sADSection = i;
					}
				}

				return sADSection;
			}),
		getLastInterSection: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}, 'firstInterSection'],
			function getLastInterSection(self, section, firstInterSection) {
				var thisAngleDiff, smallestAngleDiff = 0, sADSection = -1;

				var i = firstInterSection, candidate;
				do {
					candidate = self.sections[i];

					if (candidate.containsAngleOrEnd([section.end.angle])) {
						return i;
					}

					//Find the closest to the end
					thisAngleDiff = Polar.angleDiff([candidate.end.angle, section.end.angle]);
					if ((sADSection == -1) ||
						(thisAngleDiff < smallestAngleDiff)) {
						smallestAngleDiff = thisAngleDiff;
						sADSection = i;
					}

					i++;
					i = i % self.sections.length;
				} while (i != firstInterSection)

				return sADSection;
			}),
		_insertInitial: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function _insertInitial(self, section) {
				var	iSection = section.__deepcopy__();

				self.sections.push(iSection);
			}),
		_insertBefore: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}, 'index'],
			function _insertBefore(self, section, index) {
				self.sections.splice(index, 0, section);
			}),
		_insertAfter: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}, 'index'],
			function _insertAfter(self, section, index) {
				self.sections.splice(index + 1, 0, section);
			}),
		_insertLast: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function _insertLast(self, section) {
				self._insertAfter([section, self.sections.length - 1]);
			}),
		_remove: 
			function _remove(self, index) {
				self.sections.splice(index, 1);
			},
		shift:
			function shift(self, newFirst) {
				if (newFirst == 0) {
					return;
				}

				var head = self.sections.splice(0, newFirst);
				var tail = self.sections;

				self.sections = tail.concat(head);
			},
		mergeFirstBatch:
			function mergeFirstBatch(self) {
				if (self.sections.length <= 1) {
					return;
				}

				var firstSection = self.getSectionWrapped([0]);
				var lastSection = self.getSectionWrapped([-1]);
				if (!lastSection.isAdjacentTo([firstSection], {inOrder: True})) {
					return;
				}

				var batchStart = 0;
				var batchEnd = self.getBatchEnd([batchStart]);

				if (batchEnd == (self.sections.length - 1)) {
					return;
				}

				self.shift({newFirst: batchEnd + 1});

				self.logger.log(["Merge first batch, reposition: %s is first", batchStart]);
			},
	});

	return obj;
})(Shadows || {}, Math);
