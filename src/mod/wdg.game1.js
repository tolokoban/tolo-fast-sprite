"use strict";

require("gfx");
var $ = require("dom");
var DB = require("tfw.data-binding");
var Resize = require("webgl.resize");
var FastSprite = require("webgl.fast-sprite");


/**
 * @class Wdg.Game1
 *
 * @param {boolean} opts.visible - Set the visiblity of the component.
 *
 * @example
 * var Wdg.Game1 = require("wdg.game1");
 * var instance = new Wdg.Game1({visible: false});
 */
var Game1 = function(opts) {
  var elem = $.elem( this, 'canvas' );

  console.info( "Creation of context for WebGL 2.0" );
  var gl = elem.getContext("webgl2", {
    alpha: false,
    depth: true,
    stencil: false,
    antialias: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    failIfPerformanceCaveat: false
  });
  if( !gl ) {
    console.warn( "Fallback to WebGL 1.0" );
    gl = elem.getContext("webgl", {
      alpha: false,
      depth: true,
      stencil: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      failIfPerformanceCaveat: false
    });
  }
  this._gl = gl;

  DB.propRemoveClass( this, 'visible', 'hide' );
  DB.prop( this, "width" )(function( v ) {
    if( !isNaN(parseInt( v )) ) {
      v = v + "px";
    }
    $.css(elem, { width: v });
  });
  DB.prop( this, "height" )(function( v ) {
    if( !isNaN(parseInt( v )) ) {
      v = v + "px";
    }
    $.css(elem, { height: v });
  });
  DB.propInteger( this, 'resolution' );

  opts = DB.extend({
    visible: true,
    resolution: 1,
    width: 320,
    height: 240
  }, opts, this);

  var that = this;
  var img = new Image();
  img.src = "css/gfx/qbert.png";
  img.onload = function() {
    play.call( that, img );
  };
  img.onerror = function() {
    console.error( "Unable to load image: ", img.src );
  };
};


module.exports = Game1;




function play( atlas ) {
  var gl = this._gl;
  var resolution = this.resolution;
  var fastSprite = new FastSprite({
    gl: gl, atlas: atlas,
    cellSrcW: 1/8, cellSrcH: 1/8,
    cellDstW: 128, cellDstH: 128
  });

  Resize( gl, resolution );
  
  var x, y;
  for( y=-100 ; y<gl.canvas.height ; y+=128+64 ) {
    for( x=-100 ; x<gl.canvas.width; x+=128 ) fastSprite.addCellXY( x, 0 + y, Math.floor(4*Math.random()), 0 );
    for( x=-100 ; x<gl.canvas.width; x+=128 ) fastSprite.addCellXY( 64 + x, 96 + y, Math.floor(4*Math.random()), 0 );
  }

  var anim = function( time ) {
    requestAnimationFrame( anim );
    Resize( gl, resolution );
    fastSprite.paint( time );
  };
  requestAnimationFrame( anim );
}
