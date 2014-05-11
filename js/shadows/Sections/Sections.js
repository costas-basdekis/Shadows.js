var Shadows = (function defineSectionsSections(obj) {
	var PolarLine = Shadows.PolarLine;

	var SectionsModule = Shadows.Sections = Shadows.Sections || {};
	var Sections = SectionsModule.Sections = CLASS('Shadows.Sections.Sections', {
		__init__: METHOD(DEF(
			['self', {n: 'logger', is: ['utils.Logger']}],
			function __init__(self, logger) {
				self.sections = [];
				self.sectionsReserve = [];
				self.logger = logger;
			})),
		log: METHOD(DEF(
			['self'],
			function log(self) {
				for (var i = 0, section ; section = self.sections[i] ; i++) {
					self.logger.log(["%s %s", i + 1, section]);
				}
			})),
		clear: METHOD(DEF(
			['self'],
			function clear(self) {
				self.sectionsReserve = self.sections.concat(self.sectionsReserve);
				self.sections = [];
			})),
		insert: METHOD(DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function insert(self, section) {
				var intersects = self.intersects([section]);

				self.log();
				self.logger.log(["Intersects: %s", intersects]);
				if (intersects) {
					self.insertConflicts([section]);
				} else {
					self.insertNoConflicts([section]);
				}
			})),
		intersects: METHOD(DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function intersects(self, section) {
				var batchStart, batchEnd, batchSection = PolarLine();
				var batchStartSection, batchEndSection;

				batchStart = 0;
				while (batchStart < self.sections.length) {
					batchEnd = self.getBatchEnd([batchStart]);
					batchStartSection = self.sections[batchStart];
					batchEndSection = self.sections[batchEnd];
					if (batchStart == 1 &&
						batchEnd == (self.sections.length - 1) &&
						batchStartSection.isAdjacentTo([batchEndSection], {inOrder: True})) {
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
			})),
		insertNoConflicts: METHOD(DEF(
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
					//Append to the start of the batch
					if (section.isAdjacentTo([batchStartSection], {inOrder: True})) {
						self.logger.log(["Insert before batch starting @%s", batchStart]);
						self._insertBefore([section, batchStart]);
						return;
					}

					//Append to the end of the batch
					batchEnd = self.getBatchEnd([batchStart]);
					batchEndSection = self.sections[batchEnd];
					if (batchEndSection.isAdjacentTo([section], {inOrder: True})) {
						self.logger.log(["Insert after batch ending @%s", batchEnd]);
						self._insertAfter([section, batchEnd]);
						return;
					}

					batchStart = batchEnd + 1;
				}

				throw new ExceptionBase("insertNoConflicts did not insert");
			})),
		insertConflicts: METHOD(DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function insertConflicts(self, section) {

			})),
		getBatchEnd: METHOD(DEF(
			['self', 'batchStart'],
			function getBatchEnd(self, batchStart) {
				var prevSection = self.sections[batchStart];

				for (var i = batchStart + 1, section ; section = self.sections[i] ; i++) {
					if (!section.isAdjacentTo([prevSection])) {
						return i - 1;
					}
					prevSection = section;
				}

				return self.sections.length - 1;
			})),
		_insertInitial: METHOD(DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}],
			function _insertInitial(self, section) {
				var	iSection = section.__deepcopy__();

				self.sections.push(iSection);
			})),
		_insertBefore: METHOD(DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}, 'index'],
			function _insertBefore(self, section, index) {
				self.sections.splice(index, 0, section);
			})),
		_insertAfter: METHOD(DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}, 'index'],
			function _insertAfter(self, section, index) {
				self.sections.splice(index + 1, 0, section);
			})),
	});

	return obj;
})(Shadows || {});
