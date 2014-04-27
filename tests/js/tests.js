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
	equal(Math.CIEq([1, 1 + Math.Epsilon / 2]), True, "Almost equal works ==+e/2");
	equal(Math.CIEq([1, 1 - Math.Epsilon / 2]), True, "Almost equal works ==-e/2");
	equal(Math.CIEq([1, 1 + Math.Epsilon * 2]), False, "Almost equal works !=+2e");
});

test("CartesianPoint", function() {
	var CartesianPoint = Shadows.CartesianPoint;
	var PolarPoint = Shadows.PolarPoint;

	ok(CartesianPoint, "Exists");
	ok(CartesianPoint(), ".Create");
	ok(CartesianPoint.length, ".length");

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
	equal(p.angle, 0, "offsetAngle can do nothing");
	p.offsetAngle([Math.PI / 4]);
	equal(p.angle, -Math.PI / 4, "offsetAngle offsets");
	p.offsetAngle([Math.PI / 8]);
	equal(p.angle, -Math.PI * 3 / 8, "offsetAngle offsets");
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
