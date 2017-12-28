"use strict";

var Program = require("webgl.program");


var Sea = function( gl, assets ) {
  this._texture = createTexture( gl, assets );
  var data = new Float32Array([
    -1, -1,
    101, -1,
    -1, 17,
    101, 17
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

module.exports = Sea;


Sea.prototype.paint = function( runtime ) {
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
  prg.$uniCX = runtime.seaX;
  prg.$uniCY = runtime.seaY;
  prg.$uniCZ = runtime.seaZ;

  gl.activeTexture( gl.TEXTURE0 );
  gl.bindTexture( gl.TEXTURE_2D, this._texture );
  prg.$tex = 0;

  prg.bindAttribs( this._buff, "attUV", "attAngle" );

  gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
};


function createTexture( gl, assets ) {
  var texture = gl.createTexture();

  gl.bindTexture( gl.TEXTURE_2D, texture );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

  gl.activeTexture( gl.TEXTURE0 );
  gl.bindTexture( gl.TEXTURE_2D, texture );
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA,
    gl.RGBA, gl.UNSIGNED_BYTE,
    assets.sea2 );

  return texture;
}
