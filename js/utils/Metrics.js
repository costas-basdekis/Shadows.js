var Metrics = CLASS('utils.Metrics', {
	__init__:
		function __init__(self) {
			self.clear();
		},
	clear:
		function clear(self) {
			self.root = {_name: '<root>', _children: []};
		},
	getPart:
		function getPart(self, name) {
			var path = name.split('.');

			var part = self.root;

			for (var i = 0, partName ; partName = path[i] ; i++) {
				if (!part[partName]) {
					part._children.push(part[partName] = {
						_name: partName,
						_children: [],
					});
				}
				part = part[partName];
			}

			self.initPart([part]);

			return part;
		},
	initPart:
		function initPart(self, part) {
			if (part.hasOwnProperty('_count')) {
				return;
			}

			part._start = null;
			part._count = 0;
			part._totalTime = 0;
			part._totalCount = 0;
		},
	start:
		function start(self, name) {
			var part = self.getPart([name]);

			if (!part._count) {
				part._start = new Date;
			}
			part._count++;
		},
	end:
		function end(self, name) {
			var part = self.getPart([name]);

			assert(part._count);

			part._count--;
			var now = new Date;
			part._totalTime += now - part._start;
			part._totalCount++;
			if (part._count) {
				part._start = now;
			} else {
				part._start = null;
			}
		},
});
