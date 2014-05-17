test("QUnit works", function() {
	ok(1 == "1", "Passed!");
});

test("Shadows", function() {
	ok(Shadows, "Exists");
});

test("Math", function() {
	var Math = Shadows.Math;

	ok(Math, "Exists");
	equal(Math.CIEq([1, 1]), True, "Equal works");
	ok(Math.Epsilon != undefined, "Epsilon exists");

	var equalTestCases = [
		[1, 1 + Math.Epsilon / 2],
		[1, 1 - Math.Epsilon / 2],
	];
	for (var i = 0, testCase ; testCase = equalTestCases[i] ; i++) {
		ok(Math.CILEq(testCase), "Equal less-or-equal-than %s".interpolate(testCase));
		ok(!Math.CILt(testCase), "Equal not less-than %s".interpolate(testCase));
		ok(Math.CIEq(testCase), "Equal equal %s".interpolate(testCase));
		ok(!Math.CIGt(testCase), "Equal not greater-than %s".interpolate(testCase));
		ok(Math.CIGEq(testCase), "Equal greater-or-equal-than %s".interpolate(testCase));
	}

	var notEqualTestCases = [
		[1, 1 + Math.Epsilon * 2],
		[1, 1 - Math.Epsilon * 2],
	];
	for (var i = 0, testCase ; testCase = notEqualTestCases[i] ; i++) {
		ok(Math.CINEq(testCase), "Not-equal not-equal %s".interpolate(testCase));
		ok(!Math.CIEq(testCase), "Not-equal not equal %s".interpolate(testCase));
	}

	var lessThanTestCases = [
		[1, 1 + Math.Epsilon * 2],
		[1 - Math.Epsilon, 1 + Math.Epsilon],
	];
	for (var i = 0, testCase ; testCase = lessThanTestCases[i] ; i++) {
		ok(Math.CILEq(testCase), "Less-than less-or-equal-than %s".interpolate(testCase));
		ok(Math.CILt(testCase), "Less-than less-than %s".interpolate(testCase));
		ok(!Math.CIEq(testCase), "Less-than not equal %s".interpolate(testCase));
		ok(!Math.CIGt(testCase), "Less-than not greater-than %s".interpolate(testCase));
		ok(!Math.CIGEq(testCase), "Less-than not greater-or-equal-than %s".interpolate(testCase));
	}

	var greaterThanTestCases = [
		[1, 1 - Math.Epsilon * 2],
		[1 + Math.Epsilon, 1 - Math.Epsilon],
	];
	for (var i = 0, testCase ; testCase = greaterThanTestCases[i] ; i++) {
		ok(!Math.CILEq(testCase), "Greater-than not less-or-equal-than %s".interpolate(testCase));
		ok(!Math.CILt(testCase), "Greater-than not less-than %s".interpolate(testCase));
		ok(!Math.CIEq(testCase), "Greater-than not equal %s".interpolate(testCase));
		ok(Math.CIGt(testCase), "Greater-than greater-than %s".interpolate(testCase));
		ok(Math.CIGEq(testCase), "Greater-than greater-or-equal-than %s".interpolate(testCase));
	}
});

test("CartesianPoint", function() {
	var CartesianPoint = Shadows.CartesianPoint;
	var PolarPoint = Shadows.PolarPoint;

	ok(CartesianPoint, "Exists");
	ok(CartesianPoint(), ".Create");
	ok(CartesianPoint().length, ".length");

	var p = CartesianPoint({x: 3, y: 4});
	equal(p.x, 3, "x passed");
	equal(p.y, 4, "y passed");
	equal(p.length(), 5, "correct length");

	var p2 = p.__copy__();
	ok(p2.x == p.x && p2.y == p.y, ".copy");
	p2.x = 5; p2.y = 6;
	ok(p2.x != p.x && p2.y != p.y, "Different instances");

	var p3 = p2.__copy__();
	p3.minus([p]);
	ok(p3.x == 2 && p3.y == 2, '.minus');

	ok(p.set, ".set");
	p.set({x: 1, y: 0});
	ok(p.x == 1 && p.y == 0, "set works");

	ok(p.equals, ".equals");
	var p1 = p.__copy__();
	ok(p.equals([p1]), "Copy + equals");

	ok(p.getAngle, ".getAngle");
	ok(p.getAngle() != null, "getAngle works");
	var angleTests = [
		{x: 1, y: 0, angle: 0},
		{x: 0, y: 1, angle: Math.PI / 2},
		{x: 1, y: 1, angle: Math.PI / 4},
		{x: 1, y: -1, angle: -Math.PI / 4},
		{x: -1, y: -1, angle: -Math.PI * 3 / 4},
		{x: -1, y: 0, angle: Math.PI},
	];
	for (var i = 0, tst; tst = angleTests[i] ; i++) {
		p.set({x: tst.x, y: tst.y});
		equal(p.getAngle(), tst.angle, "correct angle %s:%s @%s".interpolate(tst.x, tst.y, tst.angle));
	}

	ok(p.toPolar, ".toPolar");
	ok(p.toPolar() != null, "toPolar works");
});

test("PolarPoint", function() {
	var CartesianPoint = Shadows.CartesianPoint;
	var PolarPoint = Shadows.PolarPoint;

	ok(PolarPoint, "Exists");
	ok(PolarPoint(), ".Create");

	var p = PolarPoint({angle: 3, distance: 4});
	equal(p.angle, 3, "angle passed");
	equal(p.distance, 4, "distance passed");

	var p2 = p.__copy__();
	ok(p2.angle == p.angle && p2.distance == p.distance, ".copy");
	p2.angle = 5; p2.distance = 6;
	ok(p2.angle != p.angle && p2.distance != p.distance, "Different instances");

	ok(p.set, ".set");
	p.set({angle: 1, distance: 0});
	ok(p.angle == 1 && p.distance == 0, "set works");

	ok(p.equals, ".equals");
	var p1 = p.__copy__();
	ok(p.equals([p1]), "Copy + equals");

	var cp = CartesianPoint({x: 1, y: 0});
	ok(p.fromCartesian, ".fromCartesian");
	ok(p.fromCartesian([cp]) == p, "fromCartesian works");
	p.fromCartesian([cp]);
	equal(p.angle, 0, "fromCartesian angle");
	equal(p.distance, 1, "fromCartesian distance");

	ok(p.offsetAngle, ".offsetAngle");
	ok(p.offsetAngle([0]) == p, "offsetAngle works");
	p.set({angle: 0, distance: 1});
	p.offsetAngle([0]);
	ok(Shadows.Math.CIEq([p.angle, 0]), "offsetAngle can do nothing");
	p.offsetAngle([Math.PI / 4]);
	ok(Shadows.Math.CIEq([p.angle, -Math.PI / 4]), "offsetAngle offsets %s != %s".interpolate(p.angle, -Math.PI / 4));
	p.offsetAngle([Math.PI / 8]);
	ok(Shadows.Math.CIEq([p.angle, -Math.PI * 3 / 8]), "offsetAngle offsets");
});


test("CartesianLine", function() {
	var CartesianPoint = Shadows.CartesianPoint;
	var PolarPoint = Shadows.PolarPoint;
	var CartesianLine = Shadows.CartesianLine;

	ok(CartesianLine, "Exists");
	ok(CartesianLine(), ".Create");

	var l1 = CartesianLine();
	ok(l1.start, "has start");
	ok(l1.end, "has end");

	ok(l1.length, "has length");
	ok(l1.length() != null, "length works");
	l1.start.set({x: 1, y: 1});
	l1.end.set({x: 4, y: 5});
	equal(l1.length(), 5, "Length is correct");

	ok(l1.minus, ".minus");
	var p1 = CartesianPoint();
	ok(l1.minus([p1]) == l1, "minus wokrs");
	l1.start.set({x: 1, y: 2});
	l1.end.set({x: 3, y: 4});
	p1.set({x: 1, y: 1});
	l1.minus([p1]);
	ok(l1.start.x == 0 &&
	   l1.start.y == 1 &&
	   l1.end.x == 2 &&
	   l1.end.y == 3, "minus is correct");
});

test("PolarLine", function() {
	var CartesianPoint = Shadows.CartesianPoint;
	var PolarPoint = Shadows.PolarPoint;
	var CartesianLine = Shadows.CartesianLine;
	var PolarLine = Shadows.PolarLine;

	ok(PolarLine, "Exists");
	ok(PolarLine(), ".Create");

	var pl1 = PolarLine();
	ok(pl1.start, "has start");
	ok(pl1.end, "has end");
	ok(pl1.isEmpty(), "is empty");
	ok(pl1.isOnPoint(), "is on point");

	var cl1 = CartesianLine();
	cl1.start.set({x: -1, y: 1});
	cl1.end.set({x: 1, y: 1});
	pl1.fromCartesian([cl1]);

	ok(pl1.start.distance == pl1.end.distance &&
	   pl1.start.distance, "fromCartesian works");

	var onPointTestCases = [
		{
			start: {x: 1, y: 0},
			end: {x: -1, y: 0},
		},
		{
			start: {x: -1, y: 0},
			end: {x: 1, y: 0},
		},
		{
			start: {x: 0, y: 1},
			end: {x: 0, y: -1},
		},
		{
			start: {x: 0, y: -1},
			end: {x: 0, y: 1},
		},
		{
			start: {x: 1, y: 1},
			end: {x: -1, y: -1},
		},
	];
	for (var i = 0, testCase ; testCase = onPointTestCases[i] ; i++) {
		cl1.start.set(testCase.start);
		cl1.end.set(testCase.end);
		pl1.fromCartesian([cl1]);
		ok(pl1.isOnPoint, "is on point, when not on the edge")
	}

	var adjacentTestCases = [
		[
			{start: {distance:1, angle: 0}, end: {distance:1, angle: 1}},
			{start: {distance:1, angle: 1}, end: {distance:1, angle: 2}},
		],
		[
			{start: {distance:1, angle: 0}, end: {distance:1, angle: 1}},
			{start: {distance:0.5, angle: 1}, end: {distance:2, angle: 2}},
		],
	];

	var pl2 = PolarLine();

	for (var i = 0, testCase ; testCase = adjacentTestCases[i] ; i++) {
		pl1.start.set(testCase[0].start);
		pl1.end.set(testCase[0].end);
		pl2.start.set(testCase[1].start);
		pl2.end.set(testCase[1].end);
		ok(pl1.isAdjacentTo([pl2], {inOrder: True}), "are adjacent in order");
		ok(pl2.isAdjacentTo([pl1], {inOrder: False}), "are adjacent reverse order");
		ok(!pl1.intersects([pl2]), "do not intersect");
		ok(!pl2.intersects([pl1]), "do not intersect reverse");
	}

	var notAdjacentTestCases = [
		[
			{start: {distance:1, angle: 0}, end: {distance:1, angle: 1}},
			{start: {distance:1, angle: 2}, end: {distance:1, angle: 3}},
		],
		[
			{start: {distance:1, angle: 0}, end: {distance:1, angle: 1}},
			{start: {distance:0.5, angle: 2}, end: {distance:2, angle: 3}},
		],
		[
			{start: {distance:1, angle: 0}, end: {distance:1, angle: 2}},
			{start: {distance:1, angle: 1}, end: {distance:1, angle: 3}},
		],
	];

	for (var i = 0, testCase ; testCase = notAdjacentTestCases[i] ; i++) {
		pl1.start.set(testCase[0].start);
		pl1.end.set(testCase[0].end);
		pl2.start.set(testCase[1].start);
		pl2.end.set(testCase[1].end);
		ok(!pl1.isAdjacentTo([pl2], {inOrder: True}), "are not adjacent in order");
		ok(!pl2.isAdjacentTo([pl1], {inOrder: False}), "are not adjacent reverse order");
	}

	var intersectTestCases = [
		[
			{start: {distance:1, angle: 0}, end: {distance:1, angle: 2}},
			{start: {distance:1, angle: 1}, end: {distance:1, angle: 3}},
		],
	];

	for (var i = 0, testCase ; testCase = intersectTestCases[i] ; i++) {
		pl1.start.set(testCase[0].start);
		pl1.end.set(testCase[0].end);
		pl2.start.set(testCase[1].start);
		pl2.end.set(testCase[1].end);
		ok(pl1.intersects([pl2]), "intersect");
		ok(pl2.intersects([pl1]), "intersect reverse");
	}

	var containsAngleTestCases = [
		{start: {distance: 1, angle: 0}, end: {distance: 1, angle: 1}, angle: 0.5, outside: -0.5},
		{start: {distance: 1, angle: 1}, end: {distance: 1, angle: 2}, angle: 1.5, outside: -0.5},
		{start: {distance: 1, angle: -1}, end: {distance: 1, angle: 1}, angle: 0, outside: -1.5},
		{start: {distance: 1, angle: -1}, end: {distance: 1, angle: 1}, angle: -0.5, outside: -1.5},
		{start: {distance: 1, angle: -1}, end: {distance: 1, angle: 1}, angle: 0.5, outside: -1.5},
	];

	for (var i = 0, testCase ; testCase = containsAngleTestCases[i] ; i++) {
		pl1.start.set(testCase.start);
		pl1.end.set(testCase.end);
		ok(pl1.containsAngle([testCase.angle]), "contains angle: inside");
		ok(pl1.containsAngleInclusive([testCase.angle]), "contains angle inclusive: inside");
		ok(pl1.containsAngleOrStart([testCase.angle]), "contains angle-or-start: inside");
		ok(pl1.containsAngleOrEnd([testCase.angle]), "contains angle-or-end: inside");

		ok(!pl1.containsAngle([testCase.start.angle]), "not contains angle: start");
		ok(pl1.containsAngleInclusive([testCase.start.angle]), "contains angle inclusive: start");
		ok(pl1.containsAngleOrStart([testCase.start.angle]), "contains angle-or-start: start");
		ok(!pl1.containsAngleOrEnd([testCase.start.angle]), "not contains angle-or-end: start");

		ok(!pl1.containsAngle([testCase.end.angle]), "not contains angle: end");
		ok(pl1.containsAngleInclusive([testCase.end.angle]), "contains angle inclusive: end");
		ok(!pl1.containsAngleOrStart([testCase.end.angle]), "not contains angle-or-start: end");
		ok(pl1.containsAngleOrEnd([testCase.end.angle]), "contains angle-or-end: end");

		ok(!pl1.containsAngle([testCase.outside]), "not contains angle: outside");
		ok(!pl1.containsAngleInclusive([testCase.outside]), "not contains angle inclusive: outside");
		ok(!pl1.containsAngleOrStart([testCase.outside]), "not contains angle-or-start: outside");
		ok(!pl1.containsAngleOrEnd([testCase.outside]), "not contains angle-or-end: outside");
	}

	ok(pl1.intersect, "intersect exists");

	var testCases = [
		{a: {start: {x: -2, y: 2}, end: {x: 2, y: 0}},
		 b: {start: {x: -1, y: 1}, end: {x: 1, y: 1}},
		 intersection: {x: 0, y: 1}},
		{a: {start: {x: 0, y: 2}, end: {x: 2, y: 0}},
		 b: {start: {x: 0, y: 1}, end: {x: 2, y: 1}},
		 intersection: {x: 1, y: 1}},
	];

	var cl1 = Shadows.CartesianLine(), cl2 = Shadows.CartesianLine(), cp1 = Shadows.CartesianPoint();
	var pl1 = Shadows.PolarLine(), pl2 = Shadows.PolarLine(), intersection;
	for (var i = 0, testCase ; testCase = testCases[i] ; i++) {
		cl1.start.set(testCase.a.start);
		cl1.end.set(testCase.a.end);
		cl2.start.set(testCase.b.start);
		cl2.end.set(testCase.b.end);
		pl1.fromCartesian([cl1]);
		pl2.fromCartesian([cl2]);
		intersection = pl1.intersect([pl2]);
		cp1.fromPolar([intersection]);
		ok(Shadows.Math.CIEq([cp1.x, testCase.intersection.x]), "Intersection x is correct: %s == %s".interpolate(cp1.x, testCase.intersection.x));
		ok(Shadows.Math.CIEq([cp1.y, testCase.intersection.y]), "Intersection y is correct: %s == %s".interpolate(cp1.y, testCase.intersection.y));
	}

	ok(pl1.containsSection, "containsSection exists");
	ok(pl1.containsSectionInclusive, "containsSectionInclusive exists");

	var testCases = [
		{
			start: -1, end: 1,
			contains: [
				{start: -0.5, end: 0.5},
				{start: 0, end: 0.5},
				{start: -0.5, end: 0},
			],
			containsInclusive: [
				{start: -1, end: 1},
				{start: 0, end: 1},
				{start: -1, end: 0},
			],
			intersect: [
				{start: -2, end: 1},
				{start: 1, end: -2},
				{start: -2, end: 0},
				{start: 0, end: 2},
				{start: -2, end: 2},
			],
			outside: [
				{start: -3, end: -2},
				{start: 2, end: 3},
				{start: 3, end: -3},
			],
		},
	];

	var pl1 = Shadows.PolarLine(), pl2 = Shadows.PolarLine();
	for (var i = 0, testCase ; testCase = testCases[i] ; i++) {
		pl1.start.set({angle: testCase.start, distance: 1});
		pl1.end.set({angle: testCase.end, distance: 1});
		for (var distance2 = 0.5 ; distance2 <= 1.5 ; distance2 += 0.5) {
			for (var j = 0, testSection ; testSection = testCase.contains[j] ; j++) {
				pl2.start.set({angle: testSection.start, distance: distance2});
				pl2.end.set({angle: testSection.end, distance: distance2});
				ok(pl1.containsSection([pl2]), "Contains contained");
				ok(pl1.containsSectionInclusive([pl2]), "Contains inclusive contained");
			}
			for (var j = 0, testSection ; testSection = testCase.containsInclusive[j] ; j++) {
				pl2.start.set({angle: testSection.start, distance: distance2});
				pl2.end.set({angle: testSection.end, distance: distance2});
				ok(!pl1.containsSection([pl2]), "Not contains contained inclusive");
				ok(pl1.containsSectionInclusive([pl2]), "Contains inclusive contained inclusive");
			}
			for (var j = 0, testSection ; testSection = testCase.intersect[j] ; j++) {
				pl2.start.set({angle: testSection.start, distance: distance2});
				pl2.end.set({angle: testSection.end, distance: distance2});
				ok(!pl1.containsSection([pl2]), "Not contains intersect");
				ok(!pl1.containsSectionInclusive([pl2]), "Not contains inclusive intersect");
			}
			for (var j = 0, testSection ; testSection = testCase.outside[j] ; j++) {
				pl2.start.set({angle: testSection.start, distance: distance2});
				pl2.end.set({angle: testSection.end, distance: distance2});
				ok(!pl1.containsSection([pl2]), "Not contains outside");
				ok(!pl1.containsSectionInclusive([pl2]), "Not contains inclusive outside");
			}
		}
	}
});

test("Walls", function() {
	var Walls = Shadows.Walls;

	ok(Walls, "Exists");
	ok(Walls(), ".Create");

	var w1 = Walls();

	w1.addBox({
		first: {x: 10, y: 10},
		third: {x: 50, y: 50},
	});

	equal(w1.lines.length, 4, "Added a box");
	for (var i = 0, line ; line = w1.lines[i] ; i++) {
		var prevLine = w1.lines[(i - 1 + w1.lines.length) % w1.lines.length];
		ok(line.start.equals([prevLine.end]), "Lines connected %s-%s".interpolate(i, i + 1));
	}
});

test("ComputeSections", function() {
	var CartesianPoint = Shadows.CartesianPoint;
	var Walls = Shadows.Walls;
	var Compute = Shadows.Sections.Compute;

	ok(Compute, "Exists");
	var w1 = Walls();
	ok(Compute({lines: w1.lines}), ".Create");

	w1.addBox({
		first: {x: 10, y: 10},
		third: {x: 50, y: 50},
	});

	var c1 = Compute({lines: w1.lines});

	var pointsInside = [];
	var step = 10 //2;
	for (var i = 10 + step ; i < 50 ; i += step) {
		for (var j = 10 + step ; j < 50 ; j += step) {
			pointsInside.push({x: i, y: j});
		}
	}

	ok(c1.compute, "Compute exists");

	var cp1 = CartesianPoint();
	for (var i = 0, point ; point = pointsInside[i] ; i++) {
		cp1.set(point);
		equal(c1.compute({center: cp1}), 4, "Compute @%s".interpolate(cp1));
		equal(c1.sections.sections.length, 4, "Has 4 sections");
	}

	var pointsOutside = [];
	var step = 10; //5;
	for (var i = 0 ; i < 50 + step ; i += step) {
		pointsOutside.push({x: i, y: 0});
		pointsOutside.push({x: i, y: 55});
		pointsOutside.push({x: 0, y: i});
		pointsOutside.push({x: 55, y: i});
	}

	for (var i = 0, point ; point = pointsOutside[i] ; i++) {
		cp1.set(point);
		equal(c1.compute({center: cp1}), 4, "Compute @%s".interpolate(cp1));
	}
});

test("PolarLineCoefs", function() {
	var PI = Shadows.Math.Polar.HALF_CIRCLE;
	var CartesianLine = Shadows.CartesianLine;
	var PolarLine = Shadows.PolarLine;
	var PolarLineCoefs = Shadows.PolarLineCoefs;

	ok(PolarLineCoefs, "Exsts");
	ok(PolarLineCoefs(), ".Create");

	var cl1 = CartesianLine();
	cl1.start.set({x: -10, y: 10});
	cl1.end.set({x: 10, y: 10});

	var pl1 = PolarLine().fromCartesian([cl1]);
	var plc1 = PolarLineCoefs();

	ok(plc1.fromLine, "fromLine exists");
	plc1.fromLine([pl1]);

	ok(plc1.atAngle, "atAngle exists");
	equal(plc1.atAngle([PI / 2]), 10, "atAngle is correct @PI / 2");
	equal(plc1.atAngle([PI / 4]), Math.sqrt(200), "atAngle is correct @PI / 4");

	var testCases = [
		{
			start: {x: 10, y: 0}, end: {x: 0, y: 10},
			tests: [
				{angle: 0, distance: 10},
				{angle: PI / 2, distance: 10},
				{angle: PI / 4, distance: Math.sqrt(50)},
			],
		},
		{
			start: {x: 10, y: 10}, end: {x: 10, y: -10},
			tests: [
				{angle: 0, distance: 10},
				{angle: PI / 4, distance: Math.sqrt(200)},
				{angle: -PI / 4, distance: Math.sqrt(200)},
			],
		},
	];

	for (var i = 0, testCase ; testCase = testCases[i] ; i++) {
		cl1.start.set(testCase.start);
		cl1.end.set(testCase.end);
		pl1.fromCartesian([cl1]);
		plc1.fromLine([pl1]);
		for (var j = 0, test ; test = testCase.tests[j] ; j++) {
			equal(plc1.atAngle([test.angle]), test.distance, "[%s].atAngle is correct @[%s]".interpolate(i, j));
		}
	}
});
