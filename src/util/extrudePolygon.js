/*
 * Extrude a polygon given its vertices and triangulated faces
 *
 * Based on:
 * https://github.com/freeman-lab/extrude
 */

import extend from 'lodash.assign';

var extrudePolygon = function(points, faces, _options) {
	var defaults = {
		top: 1,
		bottom: 0,
		closed: true
	};

	var options = extend({}, defaults, _options);

	var n = points.length;
	var positions;
	var cells;
	var topCells;
	var bottomCells;
	var sideCells;

	// If bottom and top values are identical then return the flat shape
	(options.top === options.bottom) ? flat() : full();

	function flat() {
		positions = points.map(function(p) { return [p[0], options.top, p[1]]; });
		cells = faces;
		topCells = faces;
	}

	function full() {
		positions = [];
		points.forEach(function(p) { positions.push([p[0], options.top, p[1]]); });
		points.forEach(function(p) { positions.push([p[0], options.bottom, p[1]]); });

		var cx = 0, cz = 0, cc = 0;


		// Very special case for the Transam building in SF
		if(options.feature.properties.roof_shape == "pyramidal") {

			positions.forEach(function(p) {
				if(p[1] == options.top) {
					cx += p[0];
					cz += p[2];
					cc++;
				}
			});

			cx /= cc;
			cz /= cc;

			positions.forEach(function(p) {
				if(p[1] == options.top) {
					p[0] = cx;
					p[2] = cz;
				}
			});

		}
		// -- End special case


		cells = [];
		for (var i = 0; i < n; i++) {
			if (i === (n - 1)) {
				cells.push([i + n, n, i]);
				cells.push([0, i, n]);
			} else {
				cells.push([i + n, i + n + 1, i]);
				cells.push([i + 1, i, i + n + 1]);
			}
		}

		sideCells = [].concat(cells);

		if (options.closed) {
			var top = faces;
			var bottom = top.map(function(p) { return p.map(function(v) { return v + n; }); });
			bottom = bottom.map(function(p) { return [p[0], p[2], p[1]]; });
			cells = cells.concat(top).concat(bottom);

			topCells = top;
			bottomCells = bottom;
		}
	}

	return {
		positions: positions,
		faces: cells,
		top: topCells,
		bottom: bottomCells,
		sides: sideCells
	};
};

export default extrudePolygon;
