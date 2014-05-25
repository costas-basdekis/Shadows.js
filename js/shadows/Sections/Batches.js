var Shadows = (function defineSectionsBatches(obj, jsMath) {
	var Math = Shadows.Math, Polar = Math.Polar;
	var PolarLine = Shadows.PolarLine;

	var SectionsModule = Shadows.Sections = Shadows.Sections || {};
	var Batches = SectionsModule.Batches = CLASS('Shadows.Sections.Batches', {
		__init__: DEF(
			['self', {n: 'sections', is: ["Shadows.Sections.Sections"]}],
			function __init__(self, sections) {
				self.sections = sections;
				self.clear();
			}),
		clear:
			function clear(self) {
				self.batches = [];
				self.isOneWholeBatch = False;
			},
		getBatch:
			function getBatch(self, point) {
				if (self.isOneWholeBatch) {
					return self.batches[0];
				}

				for (var i = 0, batch ; batch = self.batches[i] ; i++) {
					if ((batch.start <= point) &&
						(point >= batch.end)) {
						return batch;
					}
				}

				assert(False, "Not in a batch");
			},
		getBatchStart:
			function getBatchStart(self, point) {
				var batch = self.getBatch([point]);

				return batch.start;
			},
		getBatchEnd: 
			function getBatchEnd(self, batchStart) {
				var batch = self.getBatch([point]);

				return batch.end;
			},
		_edgesConnect:
			function _edgesConnect(self) {
					var firstSection = self.sections.getSection([0]),
						lastSection = self.sections.getSectionWrapped([-1]);

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
					var batchLength = batch.end - batch.start + 1;

					batch.start = prevBatch.end + 1;
					batch.end = batch.start + batchLength - 1;
					batch.index = i;

					prevBatch = batch;
				}

				// Merge first and last batch if necessary
				if ((self.batches.length != 1) &&
					((batch.index == 0) ||
					 (batch.index == (self.batches.length - 1))) &&
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
			},
		addToBatch: 
			function addToBatch(self, batch) {
				batch.end++;
				self.updateBatches([batch]);
			},
		mergeBatchAndNext:
			function mergeBatchAndNext(self, batch) {
				if (batch.index == (self.batches.length - 1)) {
					var nextBatch = self.getBatch([0]);
					nextBatch.start = batch.start;
					self.batches.pop();
					self.updateBatches([batch]);
				} else {
					var nextBatch = self.getBatch([batch.index + 1]);
					batch.end = nextBatch.end;
					self.batches.splice(nextBatch.index, 1);
					self.updateBatches([batch]);
				}
			},
		insertSection: DEF(
			['self', {n: 'section', is: ['Shadows.PolarLine']}, 'index', {n: 'batch', d: None}],
			function insertSection(self, section, before, batch) {
				if (!batch) {
					batch = self.getBatch([before]);
				}

				// It's surely in the only batch
				if (self.isOneWholeBatch) {
					self.addToBatch([batch]);
					return;
				}

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
					batch = self.getBatchWrapped([batch.before - 1]);
				}
				self.addToBatch([batch]);

				// Merge batches
				if (prevAdjacent && nextAdjacent) {
					self.mergeBatchAndNext([batch]);
				}
			}),
	});

	return obj;
})(Shadows || {}, Math);
