"use strict";

var Program = require("webgl.program");


// If there is no  space left to add a quad,  increase all the buffers
// to accept `BLOCK` more quads.
var BLOCK = 256;


function FastSprite( opts ) {
  this._opts = opts;
  
  if( typeof opts === 'undefined' ) fatal("Constructor's argument is mandatory!");
  if( typeof opts.gl === 'undefined' ) fatal("Constructor's argument `gl` is mandatory!");
  var gl = opts.gl;
  this._gl = gl;

  if( typeof opts.atlas === 'undefined' ) fatal("Constructor's argument `atlas` is mandatory!");
  this.updateAtlas( opts.atlas );

  // Vertices have at  leat 5 attributes :  X, Y, Z, U and  V, but for
  // custom shaders  you may need more.   You can add up  to three new
  // attributes named `attA`, `attB` and `attC`.
  this._nbAttributes = 5;

  this._capacity = BLOCK;

  this._vertData = new Float32Array( BLOCK * this._nbAttributes );
  this._vertBuff = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, this._vertBuff );
  gl.bufferData( gl.ARRAY_BUFFER, this._vertData, gl.DYNAMIC_DRAW );

  this._elemData = new Uint16Array( BLOCK * 6 );
  this._elemBuff = gl.createBuffer();
  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this._elemBuff );
  gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, this._elemData, gl.DYNAMIC_DRAW );

  this._references = new Uint16Array( BLOCK );
  this._quadsCount = 0;
  this._ptrVert = 0;
  this._ptrElem = 0;
  this._idxVert = 0;

  this._prg = new Program( gl, {
    vert: GLOBAL.vert,
    frag: GLOBAL.frag
  });
}

module.exports = FastSprite;


FastSprite.prototype.paint = function( time ) {
  var gl = this._gl;
  var prg = this._prg;

  var vertData = this._vertData;
  var vertBuff = this._vertBuff;
  var elemBuff = this._elemBuff;
  var elemData = this._elemData;

  prg.use();
  prg.$uniWidth = gl.canvas.width;
  prg.$uniHeight = gl.canvas.height;

  // Textures.
  gl.activeTexture( gl.TEXTURE0 );
  gl.bindTexture( gl.TEXTURE_2D, this._texture );
  prg.$tex = 0;

  prg.bindAttribs( vertBuff, "attPosition", "attUV" );
  gl.bindBuffer( gl.ARRAY_BUFFER, vertBuff );
  gl.bufferSubData( gl.ARRAY_BUFFER, 0, vertData );

  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, elemBuff );
  gl.bufferSubData( gl.ELEMENT_ARRAY_BUFFER, 0, elemData );

  gl.drawElements( gl.TRIANGLES, this._ptrElem, gl.UNSIGNED_SHORT, 0 );
};


FastSprite.prototype.add = function( x1, y1, z1, u1, v1,
                                     x2, y2, z2, u2, v2,
                                     x3, y3, z3, u3, v3,
                                     x4, y4, z4, u4, v4 ) {
  if( this._quadsCount >= this._capacity ) {
    // @TODO Increase the Arrays capacity.
  }

  var nbAttributes = this._nbAttributes;
  var ptrVert = this._ptrVert;
  var ptrElem = this._ptrElem;
  var idxVert = this._idxVert;

  // Vertex 0.
  this._vertData[ptrVert + 0] = x1;
  this._vertData[ptrVert + 1] = y1;
  this._vertData[ptrVert + 2] = z1;
  this._vertData[ptrVert + 3] = u1;
  this._vertData[ptrVert + 4] = v1;
  ptrVert += nbAttributes;
  // Vertex 1.
  this._vertData[ptrVert + 0] = x2;
  this._vertData[ptrVert + 1] = y2;
  this._vertData[ptrVert + 2] = z2;
  this._vertData[ptrVert + 3] = u2;
  this._vertData[ptrVert + 4] = v2;
  ptrVert += nbAttributes;
  // Vertex 2.
  this._vertData[ptrVert + 0] = x3;
  this._vertData[ptrVert + 1] = y3;
  this._vertData[ptrVert + 2] = z3;
  this._vertData[ptrVert + 3] = u3;
  this._vertData[ptrVert + 4] = v3;
  ptrVert += nbAttributes;
  // Vertex 3.
  this._vertData[ptrVert + 0] = x4;
  this._vertData[ptrVert + 1] = y4;
  this._vertData[ptrVert + 2] = z4;
  this._vertData[ptrVert + 3] = u4;
  this._vertData[ptrVert + 4] = v4;
  ptrVert += nbAttributes;
  this._ptrVert = ptrVert;

  this._elemData[ptrElem + 0] = idxVert + 0;
  this._elemData[ptrElem + 1] = idxVert + 1;
  this._elemData[ptrElem + 2] = idxVert + 2;
  this._elemData[ptrElem + 3] = idxVert + 0;
  this._elemData[ptrElem + 4] = idxVert + 2;
  this._elemData[ptrElem + 5] = idxVert + 3;

  this._idxVert += 4;
  this._ptrElem += 6;
  this._quadsCount++;
};

FastSprite.prototype.addCellXY = function( x, y, col, row ) {
  var z = this.z || 0;
  var opts = this._opts;
  var srcW = opts.cellSrcW;
  var srcH = opts.cellSrcH;
  var dstW = opts.cellDstW;
  var dstH = opts.cellDstH;

  this.add(
    x,        y,        z, srcW * col,     srcH * row,
    x + dstW, y,        z, srcW * (1+col), srcH * row,
    x + dstW, y + dstH, z, srcW * (1+col), srcH * (1+row),
    x,        y + dstH, z, srcW * col,     srcH * (1+row)
  );
};

/**
 * Push a new atlas into the graphic card memory.
 */
FastSprite.prototype.updateAtlas = function( img ) {
  var gl = this._gl;

  if( !this._texture ) {
    var texture = gl.createTexture();

    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

    this._texture = texture;
  }

  gl.activeTexture( gl.TEXTURE0 );
  gl.bindTexture( gl.TEXTURE_2D, this._texture );
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA,
    gl.RGBA, gl.UNSIGNED_BYTE,
    img );
};



/**
 * Display fatal error in the console.
 */
function fatal( msg ) {
  throw Error("[ToloFastSprite] " + msg
              + "\nMore detail at https://github.com/tolokoban/tolo-fast-sprite");
}
