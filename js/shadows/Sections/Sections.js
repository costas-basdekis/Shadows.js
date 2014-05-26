var Shadows = (function defineSectionsSections(obj, jsMath) {
	var Math = Shadows.Math, Polar = Math.Polar;
	var PolarLine = Shadows.PolarLine;

	var SectionsModule = Shadows.Sections = Shadows.Sections || {};
	var Sections = SectionsModule.Sections = CLASS('Shadows.Sections.Sections', {
		__init__: DEF(
			['self', {n: 'logger', is: ['utils.Logger']}, {n: 'metrics', is: ['utils.Metrics']}],
			function __init__(self, logger, metrics) {
				self.logger = logger;
				self.metrics = metrics;
				self.batches = Shadows.Sections.Batches([self]);
				self.clear();
			}),
		log: 
			function log(self) {
				if (self.logger.muted) {
					return;
				}
				for (var i = 0, section ; section = self.sections[i] ; i++) {
					self.logger.log(["%s %s", i + 1, section]);
				}
			},
		clear: 
			function clear(self) {
				self.sections = [];
				self.batches.clear();
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
				var wrappedIndex = self.wrapIndex([index]);

				var section = self.getSection([wrappedIndex]);

				return section;
			},
		wrapIndex:
			function wrapIndex(self, index) {
				var wrappedIndex = index;

				if (wrappedIndex < 0) {
					wrappedIndex += self.sections.length;
				} else if (wrappedIndex >= self.sections.length) {
					wrappedIndex -= self.sections.length;
				}

				return wrappedIndex;
			},
		intersects: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function intersects(self, section) {
				if (!self.sections.length) {
					return False;
				}

				if (self.batches.isOneWholeBatch) {
					return True;
				}

				var batchSection = PolarLine.__make__();
				var batchSectionStart = batchSection.start, batchSectionEnd = batchSection.end;
				var batchStartSection, batchEndSection;

				var result = False;

				var sections = self.sections, batches = self.batches.batches;

				for (var i = 0, batch ; batch = batches[i] ; i++) {
					batchStartSection = sections[batch.start];
					batchEndSection = sections[batch.end];

					batchSection.start = batchStartSection.start;
					batchSection.end = batchEndSection.end;

					if (section.intersects([batchSection])) {
						result = True;
						break;
					}
				}

				batchSection.start = batchSectionStart;
				batchSection.end = batchSectionEnd;
				PolarLine.__take__([batchSection]);

				return result;
			}),
		insertNoConflicts: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function insertNoConflicts(self, section) {
				if (self.sections.length == 0) {
					self.metrics.start(['ComputeStep.insertNoConflicts.insert']);
					self.logger.log(["Insert first section"]);
					self.metrics.end(['ComputeStep.insertNoConflicts.insert']);
					self._insertInitial([section]);
					return;
				}

				var sections = self.sections, batches = self.batches.batches;

				for (var i = 0, batch ; batch = batches[i] ; i++) {
					var prevSection = self.getSectionWrapped([batch.start - 1]),
						nextSection = sections[batch.start];

					self.metrics.start(['ComputeStep.insertNoConflicts.isBetween']);
					var isBetween = section.isBetween([prevSection, nextSection]);
					self.metrics.end(['ComputeStep.insertNoConflicts.isBetween']);

					if (isBetween) {
						self.logger.log(["Insert before batch @%s", batch.start]);
						self.metrics.start(['ComputeStep.insertNoConflicts.insert']);
						self._insertBefore([section, batch.start]);
						self.metrics.end(['ComputeStep.insertNoConflicts.insert']);
						return;
					}

					prevBatch = batch;
				}

				throw new ExceptionBase("insertNoConflicts did not insert @%s".interpolate(self.center));
			}),
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
				var	iSection = PolarLine.__make__().copyFrom([section]);

				self.sections.push(iSection);
				self.batches.insertSection([section, 0]);
			}),
		_insertBefore: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}, 'index'],
			function _insertBefore(self, section, index) {
				self.sections.splice(index, 0, section);
				self.batches.insertSection([section, index]);
			}),
		_insertAfter: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}, 'index'],
			function _insertAfter(self, section, index) {
				self.sections.splice(index + 1, 0, section);
				self.batches.insertSection([section, index + 1]);
			}),
		_insertLast: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function _insertLast(self, section) {
				self._insertAfter([section, self.sections.length - 1]);
			}),
		_remove: 
			function _remove(self, index) {
				self.sections.splice(index, 1);
				self.batches.removeSection([index]);
			},
	});

	return obj;
})(Shadows || {}, Math);
