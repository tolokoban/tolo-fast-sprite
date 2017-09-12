"use strict";

require("gfx");
var $ = require("dom");
var DB = require("tfw.data-binding");
var Resize = require("webgl.resize");
var Levels = require("wdg.game1.levels");
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
    antialias: false,
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

  var level = new Levels( "qbert1", fastSprite );
  
  gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE );

  var anim = function( time ) {
    requestAnimationFrame( anim );
    Resize( gl, resolution );

    gl.clearColor( 0, 0, 0, 0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    fastSprite.paint( time );
  };
  requestAnimationFrame( anim );
}
