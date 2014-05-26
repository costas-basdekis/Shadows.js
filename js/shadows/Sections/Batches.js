var Shadows = (function defineSectionsBatches(obj, jsMath) {
	var Math = Shadows.Math, Polar = Math.Polar;
	var PolarLine = Shadows.PolarLine;

	var SectionsModule = Shadows.Sections = Shadows.Sections || {};
	var Batches = SectionsModule.Batches = CLASS('Shadows.Sections.Batches', {
		__init__: DEF(
			['self', {n: 'sections', is: ["Shadows.Sections.Sections"]}],
			function __init__(self, sections) {
				self.sections = sections;
				self.logger = self.sections.logger;
				self.clear();
			}),
		log:
			function log(self) {
				if (self.logger.muted) {
					return;
				}
				self.logger.log(['Is one whole batch: %s', self.isOneWholeBatch]);
				self.logger.indent();
				for (var i = 0, batch ; batch = self.batches[i] ; i++) {
					self.logger.log(["%s: %s-%s", batch.index, batch.start, batch.end]);
				}
				self.logger.dedent();
			},
		clear:
			function clear(self) {
				self.batches = [];
				self.isOneWholeBatch = False;
			},
		findBatch:
			function findBatch(self, point) {
				if (self.isOneWholeBatch) {
					return self.batches[0];
				}

				for (var i = 0, batch ; batch = self.batches[i] ; i++) {
					if ((batch.start <= point) &&
						(point <= batch.end)) {
						return batch;
					} else if (
						(batch.end < batch.start) &&
						((point > batch.end) || 
						 (point < batch.start))) {
						return batch;
					}
				}

				assert(False, "Not in a batch");
			},
		getBatch:
			function getBatch(self, index) {
				var batch = self.batches[index];

				if (!batch) {
					throw ExceptionBase("Out of bounds index: %s".interpolate(index));
				}

				return batch;
			},
		getBatchWrapped:
			function getBatchWrapped(self, index) {
				var wrappedIndex = index;

				if (wrappedIndex < 0) {
					wrappedIndex += self.batches.length;
				} else if (wrappedIndex >= self.batches.length) {
					wrappedIndex -= self.batches.length;
				}

				var batch = self.getBatch([wrappedIndex]);

				return batch;
			},
		getBatchStart:
			function getBatchStart(self, point) {
				var batch = self.findBatch([point]);

				return batch.start;
			},
		getBatchEnd: 
			function getBatchEnd(self, point) {
				var batch = self.findBatch([point]);

				return batch.end;
			},
		_edgesConnect:
			function _edgesConnect(self) {
					var firstBatch = self.getBatch([0]),
						lastBatch = self.getBatchWrapped([-1]);
					var firstSection = self.sections.getSection([firstBatch.start]),
						lastSection = self.sections.getSectionWrapped([lastBatch.end]);

					return lastSection.isAdjacentTo([firstSection], {inOrder: True});
			},
		insertBatch:
			function insertBatch(self, batch) {
				batch.index = batch.index % (self.batches.length + 1);
				self.batches.splice(batch.index, 0, batch);
				self.updateBatches([batch]);
			},
		updateBatches:
			function updateBatches(self, afterBatch) {
				var prevBatch = afterBatch;
				for (var i = afterBatch.index + 1, batch ; batch = self.batches[i] ; i++) {
					var batchLength;

					if (batch.start <= batch.end) {
						batchLength = batch.end - batch.start + 1;
						batch.start = self.sections.wrapIndex([prevBatch.end + 1]);
						batch.end = self.sections.wrapIndex([batch.start + batchLength - 1]);
					} else {
						batch.start = self.sections.wrapIndex([prevBatch.end + 1]);
					}

					batch.index = i;

					prevBatch = batch;
				}

				// Merge first and last batch if necessary
				if ((self.batches.length > 1) &&
					(self.sections.sections.length > 0) &&
					((afterBatch.index == 0) ||
					 (afterBatch.index == (self.batches.length - 1))) &&
					self._edgesConnect()) {
					var firstBatch = self.getBatch([0]),
						lastBatch = self.getBatchWrapped([-1]);

					firstBatch.start = lastBatch.start;
					self.batches.pop();
				}

				// Update if it is one whole batch
				if ((self.batches.length == 1) &&
					!self.isOneWholeBatch) {
					self.isOneWholeBatch = self._edgesConnect();
				}

				self.logger.log(["Updated batches:"]);
				self.log();
			},
		addToBatch: 
			function addToBatch(self, batch) {
				batch.end = self.sections.wrapIndex([batch.end + 1]);
			},
		addToBatchStart:
			function addToBatchStart(self, batch) {
				batch.start = self.sections.wrapIndex([batch.start - 1]);
			},
		addToBatchEnd:
			function addToBatchEnd(self, batch) {
				batch.end = self.sections.wrapIndex([batch.end + 1]);
			},
		mergeBatchAndNext:
			function mergeBatchAndNext(self, batch) {
				if (self.batches.length == 1) {
					self.isOneWholeBatch = True;
					self.updateBatches([batch]);
					return;
				}

				if (batch.index == (self.batches.length - 1)) {
					var nextBatch = self.getBatch([0]);
					nextBatch.start = batch.start;
					self.batches.pop();
					self.updateBatches([batch]);
				} else {
					var nextBatch = self.getBatchWrapped([batch.index + 1]);
					batch.end = nextBatch.end;
					self.batches.splice(nextBatch.index, 1);
					self.updateBatches([batch]);
				}
			},
		sectionAdded:
			function sectionAdded(self, before) {
				self.logger.log(['Section added @%s', before]);
				self.log();
				for (var i = 0, batch ; batch = self.batches[i] ; i++) {
					if (batch.start <= batch.end){
						if (before <= batch.start) {
							batch.start++;
							batch.end++;
						} else if (before < batch.end) {
							batch.end++;
						}
					} else {
						if (before <= batch.start) {
							batch.start++;
						}
						if (before <= batch.end) {
							batch.end++;
						}
					}
					batch.start = self.sections.wrapIndex([batch.start]);
					batch.end = self.sections.wrapIndex([batch.end]);
				}
				self.logger.log(['Now:']);
				self.log();
			},
		getInsertBatch:
			function getInsertBatch(self, index) {
				var batch, prevBatch;

				// Just before the first
				if (self.getBatch([0]).start == (index + 1)) {
					return self.getBatch([0]);
				}

				// Just after the last
				if (self.getBatchWrapped([-1]).end == (index - 1)) {
					return self.getBatch([0]);
				}

				for (var i = 0 ; batch = self.batches[i] ; i++) {
					// Inside the batch
					if ((batch.start <= index) &&
						(index <= batch.end)) {
						return batch;
					}
					// Between the two batches
					if (prevBatch &&
						(prevBatch.end == self.sections.wrapIndex([index - 1])) &&
						(batch.start == self.sections.wrapIndex([index + 1]))) {
						return batch;
					}
					prevBatch = batch;
				}

				assert(False, "Could not find insert batch");
			},
		insertSection: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}, 'before'],
			function insertSection(self, section, before) {
				self.logger.log(['About to insert section:']);
				self.log();

				// First batch
				if (self.batches.length == 0) {
					self.insertBatch([{start: 0, end: 0, index: 0}]);
					return;
				}

				// It's surely in the only batch
				if (self.isOneWholeBatch) {
					var batch = self.getBatch([0]);
					self.addToBatch([batch]);
					return;
				}

				self.sectionAdded([before]);
				var batch = self.getInsertBatch([before]);

				// It's inside the batch
				if ((batch.start < before) && 
					(before <= batch.end)) {
					self.addToBatch([batch]);
					return;
				}

				var prevSection = self.sections.getSectionWrapped([before - 1]),
					nextSection = self.sections.getSectionWrapped([before + 1]);
				var prevAdjacent = prevSection.isAdjacentTo([section], {inOrder: True}),
					nextAdjacent = section.isAdjacentTo([nextSection], {inOrder: True});

				// Add to the batch before it
				if (prevAdjacent) {
					batch = self.getBatchWrapped([batch.index - 1]);
					self.addToBatchEnd([batch]);
				// Add to the batch after it
				} else if (nextAdjacent) {
					self.addToBatchStart([batch]);
				// New batch
				} else {
					self.insertBatch([{start: before, end: before, index: batch.index}]);
				}

				// Merge batches
				if (prevAdjacent && nextAdjacent) {
					self.mergeBatchAndNext([batch]);
				}

				self.logger.log(["Add batch:"]);
				self.log();
			}),
		removeSection: 
			function removeSection(self, index) {
				self.logger.log(['About to remove section:']);
				self.log();

				for (var i = 0, batch ; batch = self.batches[i] ; i++) {
					batch.index = i;
					if ((batch.start == batch.end) &&
						(batch.start == index)) {
						self.batches.splice(i, 0);
						i--;
						index -= 0.5;
					} else {
						if (batch.start > index) {
							batch.start = self.sections.wrapIndex([batch.start - 1]);
						}
						if (batch.end >= index) {
							batch.end = self.sections.wrapIndex([batch.end - 1]);
						}
					}
				}

				self.logger.log(['Removed section, now:']);
				self.log();
			},
	});

	return obj;
})(Shadows || {}, Math);
