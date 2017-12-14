// Common functions for sequences.
"use strict";

var Resize = require("webgl.resize");
var Coords = require("game1.coords");


exports.paint = function( runtime, zoomLegend, zoomPlayground ) {
  var gl = runtime.gl;
  var playground = runtime.playground;
  var legend = runtime.legend;
  var time = runtime.time;
  var hero = runtime.hero;
  var resolution   = runtime.resolution;

  Resize( gl, resolution );

  gl.clearColor( .4, .6, 1, 0 );
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

  // Put the legend in the top-left corner.
  legend.centerX = (gl.canvas.width * 0.5 - 10) / zoomLegend;
  legend.centerY = (gl.canvas.height * 0.5 - 10) / zoomLegend;
  legend.zoom = zoomLegend;
  legend.paint( time );
  // Display the playground after the legend to get advantage of the
  // depth-buffer optimization.
  playground.zoom = zoomPlayground;
  // Scrolling. We put the hero at center.
  Coords.set( hero.col, hero.row );
  playground.centerX = Coords.x;
  playground.centerY = Coords.y;

  playground.paint( time );
};


exports.clamp = function(v, min, max) {
  if( v > max ) return max;
  if( v < min ) return min;
  return v;
};
