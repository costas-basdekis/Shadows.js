var Shadows = (function defineNewSections(obj) {
	var NewSections = Shadows.NewSections = CLASS('Shadows.NewSections', {
		__init__: 
			function __init__(self) {
				self.__super__({name: '__init__'})();

				self.sections = [];
				self.sectionsReserve = [];
			},
		fromLines: 
			function fromLines(self, lines, center) {
				self.center = center;
				self.sectionsReserve = self.sectionsReserve.concat(self.sections);
				self.sections = [];

				var cl = Shadows.CartesianLine(), pl;

				for (var i = 0, line ; line = lines[i] ; i++) {
					cl.copyFrom([line]);
					cl.minus([self.center]);
					if (self.sectionsReserve.length) {
						pl = self.sectionsReserve.pop();
					} else {
						pl = Shadows.PolarLine();
					}
					pl.fromCartesian([cl]);
					self.sections.push(pl);
				}
			},
		sortKey: STATICMETHOD(DEF(
			[{n: 'line', is: ['Shadows.PolarLine']}],
			function sortKey(line) {
				return Math.min(line.start.distance, line.end.distance);
			})),
		sortFunction: JS(function sortFunction(lhs, rhs) {
				var sortKey = Shadows.NewSections.__class_def__.sortKey;
			 	var lKey = sortKey([lhs]);
			 	var rKey = sortKey([rhs]);

			 	if (lKey < rKey) {
			 		return -1;
			 	} else if (lKey > rKey) {
			 		return 1;
			 	} else {
			 		return 0;
			 	}
			 }),
		sort: 
			function sort(self) {
				self.sections = self.sections.sort(self.sortFunction);
			},
	});

	return obj;
})(Shadows || {});
