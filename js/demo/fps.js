var FPSCounter = (function initFPSCounter() {
	var FPSCounter = function FPSCounter(options) {
		this.sum = 0;
		this.samples = [];
		this.maxSampleCount = options.maxSampleCount || 100;
		this.fps = "";
		this.element = options.element || null;
	};

	FPSCounter.prototype.start = function start() {
		this._sampleStart = new Date;
	};

	FPSCounter.prototype.end = function end() {
		this._sampleEnd = new Date;
		var sample = this._sampleEnd - this._sampleStart;
		return this.addSample(sample / 1000);
	}

	FPSCounter.prototype.addSample = function addSample(sample) {
		if (typeof sample !== "undefined") {
			this.samples.push(sample);
			this.sum += sample;
			while (this.samples.length >= this.maxSampleCount) {
				this.sum -= this.samples.shift();
			}
		}

		this.fps = "";
		if (this.samples.length) {
			this.fps = Math.round(this.samples.length / this.sum);
		}

		if (this.element) {
			var element = document.getElementById(this.element) || null;
			if (element) {
				element.textContent = this.fps;
			}
		}

		return this.fps;
	}

	return FPSCounter;
})();
