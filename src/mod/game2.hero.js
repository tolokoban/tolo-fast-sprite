"use strict";

var Program = require("webgl.program");
var Controls = require("game2.controls");


var Hero = function( gl, assets ) {
  this._texture = createTexture( gl, assets );
  var data = new Float32Array([
    0, 0, 0, 0,
    1, 0, 1, 0,
    0, .125, -0.08, .09375,
    1, .125, 1.08, .09375,
    0, .25, -0.12, .1875,
    1, .25, 1.12, .1875,
    0, .375, -0.08, .28125,
    1, .375, 1.08, .28125,
    0, .5, 0, .375,
    1, .5, 1, .375,
    0, 1, 0, .875,
    1, 1, 1, .875
  ]);
  var buff = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, buff );
  gl.bufferData( gl.ARRAY_BUFFER, data, gl.STATIC_DRAW );

  this._buff = buff;
  this._prg = new Program( gl, {
    vert: GLOBAL.vert, frag: GLOBAL.frag
  });

  gl.bindBuffer( gl.ARRAY_BUFFER, buff );
  gl.bufferSubData( gl.ARRAY_BUFFER, 0, data );


};

module.exports = Hero;


Hero.prototype.paint = function( runtime ) {
  var gl = runtime.gl;
  var prg = this._prg;
  var time = runtime.time;

  prg.use();
  prg.$uniWidth = gl.canvas.width;
  prg.$uniHeight = gl.canvas.height;
  prg.$uniTime = runtime.time;
  prg.$uniX = runtime.x;
  prg.$uniY = runtime.y;
  prg.$uniZ = runtime.z;
  prg.$uniFlip = Controls.W ? 1 : 0;

  gl.activeTexture( gl.TEXTURE0 );
  gl.bindTexture( gl.TEXTURE_2D, this._texture );
  prg.$tex = 0;

  prg.bindAttribs( this._buff, "attUV", "attXY" );

  gl.drawArrays( gl.TRIANGLE_STRIP, 0, 12 );
};


function createTexture( gl, assets ) {
  var texture = gl.createTexture();

  gl.bindTexture( gl.TEXTURE_2D, texture );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

  gl.activeTexture( gl.TEXTURE0 );
  gl.bindTexture( gl.TEXTURE_2D, texture );
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA,
    gl.RGBA, gl.UNSIGNED_BYTE,
    assets.hero );

  return texture;
}
