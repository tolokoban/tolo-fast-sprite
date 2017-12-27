"use strict";

var ATLAS_SIZE = 2048;
var W = 1.0;

var Shaders = require("game2.shaders");
var Program = require("webgl.program");


var World = function( assets ) {
  this._assets = assets;
  this._attributes = [];
  this._canvas = document.createElement( "canvas" );
  this._canvas.setAttribute( "width", ATLAS_SIZE );
  this._canvas.setAttribute( "height", ATLAS_SIZE );
  this._map = createMap( assets, this._canvas );
};

module.exports = World;


World.prototype.createPainter = function( runtime ) {
  var gl = runtime.gl;

  var texture = createTextureFromAtlas( gl, this._canvas );

  var data = new Float32Array( this._attributes );
  var buff = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, buff );
  gl.bufferData( gl.ARRAY_BUFFER, data, gl.STATIC_DRAW );
  var prg = new Program( gl, {
    vert: Shaders.vert, frag: Shaders.frag
  });

  gl.bindBuffer( gl.ARRAY_BUFFER, buff );
  gl.bufferSubData( gl.ARRAY_BUFFER, 0, data );

  var count = Math.floor( data.length / 5 );

  return function() {
    var time = runtime.time;

    prg.use();
    prg.$uniWidth = gl.canvas.width;
    prg.$uniHeight = gl.canvas.height;
    prg.$uniX = runtime.x;
    prg.$uniY = runtime.y;
    prg.$uniZ = runtime.z;
    prg.$uniZoom = runtime.zoom;

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture );
    prg.$tex = 0;

    prg.bindAttribs( buff, "attPosition", "attUV" );

    gl.drawArrays( gl.TRIANGLES, 0, count );
  };
};


function createTextureFromAtlas( gl, canvas ) {
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
    canvas );

  return texture;
}


World.prototype.addObj = function( imageName, x, y, z, w, h ) {
  var box = this.getBox( imageName );
  x -= w * 0.5 - 0.5;
  z += 0.5;
  this.addTri(
    x,     y,     z, box.u0, box.v0,
    x + w, y,     z, box.u1, box.v0,
    x + w, y + h, z, box.u1, box.v1
  );
  this.addTri(
    x,     y,     z, box.u0, box.v0,
    x + w, y + h, z, box.u1, box.v1,
    x    , y + h, z, box.u0, box.v1
  );
};

World.prototype.addFloor = function( imageName, x, y, z ) {
  var box = this.getBox( imageName );
  this.addTri(
    x,     y, z,     box.u0, box.v0,
    x + W, y, z,     box.u1, box.v0,
    x + W, y, z + W, box.u1, box.v1
  );
  this.addTri(
    x,     y, z,     box.u0, box.v0,
    x + W, y, z + W, box.u1, box.v1,
    x    , y, z + W, box.u0, box.v1
  );
};

World.prototype.addFace = function( imageName, x, y, z ) {
  var box = this.getBox( imageName );
  this.addTri(
    x,     y,     z, box.u0, box.v0,
    x + W, y,     z, box.u1, box.v0,
    x + W, y - W, z, box.u1, box.v1
  );
  this.addTri(
    x,     y,     z, box.u0, box.v0,
    x + W, y - W, z, box.u1, box.v1,
    x    , y - W, z, box.u0, box.v1
  );
};

World.prototype.addSide = function( imageName, x, y, z ) {

};


World.prototype.addTri = function( x1, y1, z1, u1, v1, x2, y2, z2, u2, v2, x3, y3, z3, u3, v3 ) {
  this._attributes.push( x1, y1, z1, u1, v1, x2, y2, z2, u2, v2, x3, y3, z3, u3, v3 );
};


World.prototype.getBox = function( imageName ) {
  var box = this._map[ imageName ];
  if( !box ) {
    throw Error("Unkown image \"" + imageName + "\" in " + Object.keys(this._map).join(", ") );
  }
  return box;
};


function createMap( assets, canvas ) {
  var map = {};
  var x = 0, y = 0, nextY = 0;
  var imageName, img;
  var ctx = canvas.getContext("2d");
  for( imageName in assets ) {
    img = assets[imageName];
    if( img.width + x > ATLAS_SIZE ) {
      // Passer à la ligne.
      y = nextY;
      x = 0;
    }
    map[imageName] = {
      u0: x / ATLAS_SIZE, v0: (y + img.height) / ATLAS_SIZE,
      u1: (x + img.width) / ATLAS_SIZE, v1: y / ATLAS_SIZE
    };
    ctx.drawImage( img, x, y );
    x += img.width + 1;
    nextY = Math.max( nextY, y + img.height + 1 );
  }
  return map;
}
