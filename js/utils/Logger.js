var Logger = CLASS('utils.Logger', {
	__init__: METHOD(DEF(
		['self', {n: 'tab', d: '    '}, {n:'muted', d: True}],
		function __init__ (self, tab, muted) {
			self.tab = tab;
			self.tabcount = 0;
			self.tabs = '';
			self.muted = bool(muted);
		})),
	render: METHOD(DEF(
		['self', 'format', 'args'],
		function render(self, format, args) {
			var str = format.interpolate.apply(format, args);
			str = '%s%s'.interpolate(self.tabs, str);

			return str;
		})),
	mute: METHOD(DEF(
		['self'],
		function mute(self) {
			self.muted = True;
		})),
	unmute: METHOD(DEF(
		['self'],
		function unmute(self) {
			self.muted = False;
		})),
	log: METHOD(DEF(
		['self', 'format', '*'],
		function log(self, format, args) {
			if (self.muted) {
				return '';
			}
			
			var str = self.render([format, args]);

			console.log(str);

			return str;
		})),
	warning: METHOD(DEF(
		['self', 'format', '*'],
		function warning(self, format, args) {
			if (self.muted) {
				return '';
			}
			
			var str = self.render([format, args]);

			console.warning(str);

			return str;
		})),
	error: METHOD(DEF(
		['self', 'format', '*'],
		function error(self, format, args) {
			if (self.muted) {
				return '';
			}
			
			var str = self.render([format, args]);

			console.error(str);

			return str;
		})),
	setIndent: METHOD(DEF(
		['self', 'count'],
		function setIndent(self, count) {
			count = parseInt(count);
			if (count >= 0 && !isNaN(count)) {
				self.tabcount = count;
				self.updateTabs();
			}

			return self.tabcount;
		})),
	indent: METHOD(DEF(
		['self', {n: 'count', d: 1}],
		function indent(self, count) {
			return self.setIndent([self.tabcount + count]);
		})),
	unident: METHOD(DEF(
		['self', {n: 'count', d: 1}],
		function unident(self, count) {
			return self.setIndent([self.tabcount - count]);
		})),
	reset: METHOD(DEF(
		['self'],
		function  reset (self) {
			return self.setIndent([0]);
		})),
	updateTabs: METHOD(DEF(
		['self'],
		function updateTabs (self) {
			var tabs = '';

			for (var i = 0 ; i < self.tabcount ; i++) {
				tabs += self.tab;
			}

			self.tabs = tabs;

			return self.tabs;
		})),
})
