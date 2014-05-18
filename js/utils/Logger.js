var Logger = CLASS('utils.Logger', {
	__init__: DEF(
		['self', {n: 'tab', d: '    '}, {n:'muted', d: True}],
		function __init__ (self, tab, muted) {
			self.tab = tab;
			self.tabcount = 0;
			self.tabs = '';
			self.muted = bool(muted);
		}),
	render: 
		function render(self, format, args) {
			var str = format.interpolate.apply(format, args);
			str = '%s%s'.interpolate(self.tabs, str);

			return str;
		},
	toggle: DEF(
		['self', {n: 'to', d: None}],
		function toggle(self, to) {
			if (to === None) {
				to = !self.muted;
			}

			if (to) {
				self.mute();
			} else {
				self.unmute();
			}
		}),
	mute: 
		function mute(self) {
			self.muted = True;
		},
	unmute: 
		function unmute(self) {
			self.muted = False;
		},
	begin:
		function begin(self) {
			if (!self.muted) {
				console.clear();
			}
			self.log([">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"]);
		},
	end:
		function end(self) {
			self.log(["<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"]);
		},
	log: DEF(
		['self', 'format', '*'],
		function log(self, format, args) {
			if (self.muted) {
				return '';
			}
			
			var str = self.render([format, args]);

			console.log(str);

			return str;
		}),
	warning: DEF(
		['self', 'format', '*'],
		function warning(self, format, args) {
			if (self.muted) {
				return '';
			}
			
			var str = self.render([format, args]);

			console.warning(str);

			return str;
		}),
	error: DEF(
		['self', 'format', '*'],
		function error(self, format, args) {
			if (self.muted) {
				return '';
			}
			
			var str = self.render([format, args]);

			console.error(str);

			return str;
		}),
	setIndent: 
		function setIndent(self, count) {
			count = parseInt(count);
			if (count >= 0 && !isNaN(count)) {
				self.tabcount = count;
				self.updateTabs();
			}

			return self.tabcount;
		},
	indent: DEF(
		['self', {n: 'count', d: 1}],
		function indent(self, count) {
			return self.setIndent([self.tabcount + count]);
		}),
	dedent: DEF(
		['self', {n: 'count', d: 1}],
		function dedent(self, count) {
			return self.setIndent([self.tabcount - count]);
		}),
	reset: DEF(
		['self'],
		function  reset (self) {
			return self.setIndent([0]);
		}),
	updateTabs: 
		function updateTabs (self) {
			var tabs = '';

			for (var i = 0 ; i < self.tabcount ; i++) {
				tabs += self.tab;
			}

			self.tabs = tabs;

			return self.tabs;
		},
})
