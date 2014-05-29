var ShadowsApp = (function defineDispalyMetrics(obj, _) {
	App = obj;

	var displayMetrics = App.displayMetrics = App.displayMetrics || {};

	displayMetrics.init = function init() {
		this.tableElement = document.getElementById('metrics').firstChild;
		this.template = document.getElementById('metrics-row-template').textContent;
		this.div = document.createElement('div');
		var div = document.createElement('div');
		this.textNode = document.createTextNode('');
		div.appendChild(this.textNode);

		this.display.startPeriodical();
		document.getElementById('clearMetrics').onclick = this.clearMetrics_onclick;
		document.getElementById('refreshMetrics').onclick = this.refreshMetrics_onclick;
		document.getElementById('pauseMetrics').onclick = this.pauseMetrics_onclick;
	};

	displayMetrics.clearMetrics_onclick = function clearMetrics_onclick() {
		App.computeSections.metrics.clear();
		displayMetrics.display();
	};

	displayMetrics.refreshMetrics_onclick = function refreshMetrics_onclick() {
		displayMetrics.display();
	};

	displayMetrics.pauseMetrics_onclick = function pauseMetrics_onclick() {
		App.computeSections.sections.metrics.paused = this.checked;
	};

	displayMetrics.deleteRows = function deleteRows() {
		var previousRows = document.getElementsByClassName('metrics-row');

		for (var i = previousRows.length - 1, element ; element = previousRows[i] ; i--) {
			element.remove();
		}
	};

	displayMetrics.display = function display() {
		this.displayMetrics(App.computeSections.metrics);
	};
	displayMetrics.display.interval = 2500;

	displayMetrics.display.startPeriodical = function startPeriodical() {
		this.stopPeriodical();

		this.timer = window.setInterval(this.bind(displayMetrics), this.interval);
	};
	displayMetrics.display.stopPeriodical = function stopPeriodical() {
		if (this.timer) {
			window.clearInterval(this.timer);
		}
		this.timer = null;
	};

	displayMetrics.displayMetrics = function displayMetrics(metrics) {
		this.deleteRows();

		var rootTime = this.getNodeTime(metrics.root);

		this.appendNode(metrics.root, null, rootTime, '');
	};

	displayMetrics.getNodeTime = function getNodeTime(node) {
		if (node.hasOwnProperty('_totalTime')) {
			return node._totalTime;
		} else {
			var _totalTime = 0;

			for (var i = 0, child ; child = node._children[i] ; i++) {
				_totalTime += this.getNodeTime(child);
			}

			return _totalTime;
		}
	};

	displayMetrics.escapeHTML = function escapeHTML(text) {
		this.textNode.textContent = text;
		return this.textNode.parentElement.innerHTML;
	}

	displayMetrics.appendRow = function appendRow(row, parent, rootTime, indent) {
		var parentTime = row._totalTime;

		if (parent) {
			parentTime = parent._totalTime;
		}

		var html = this.template.interpolate(
			indent + this.escapeHTML(row._name),
			this.escapeHTML(row._totalTime),
			Math.round(row._totalTime / parentTime * 100),
			Math.round(row._totalTime / rootTime * 100),
			row._totalCount,
			Math.round(row._totalTime / row._totalCount * 1000) / 1000
		);

		var row = document.createElement('div');
		this.tableElement.appendChild(row);
		row.outerHTML = html;
	};

	displayMetrics.appendNode = function appendNode(node, parent, rootTime, indent) {
		this.appendRow(node, parent, rootTime, indent);
		
		if (node._children) {
			for (var i = 0, child ; child = node._children[i] ; i++) {
				this.appendNode(child, node, rootTime, '&nbsp;&nbsp;' + indent);
			}
		}
	};

	return obj;
})(ShadowsApp || {}, paper);
