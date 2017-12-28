"use strict";

require("game2.gfx");
var $ = require("dom");
var DB = require("tfw.data-binding");
var Msg = require("tfw.message").info;
var Splash = require("splash");
var Resize = require("webgl.resize");
var Runtime = require("game2.runtime");
var Controls = require("game2.controls");


/**
 * @class Wdg.Game2
 *
 * @param {boolean} opts.visible - Set the visiblity of the component.
 *
 * @example
 * var Wdg.Game2 = require("game2");
 * var instance = new Wdg.Game2({visible: false});
 */
var Game2 = function(opts) {
  var splashPromise = Splash({
    tree: "css/game2.gfx/tree.png",
    grass: "css/game2.gfx/grass.jpg",
    ground: "css/game2.gfx/ground.jpg",
    hero: "css/game2.gfx/hero.png",
    spot: "css/game2.gfx/spot.png",
    sword: "css/game2.gfx/sword.png",
    peopleA: "css/game2.gfx/peopleA.png",
    peopleB: "css/game2.gfx/peopleB.png",
    peopleC: "css/game2.gfx/peopleC.png",
    peopleD: "css/game2.gfx/peopleD.png",
    house: "css/game2.gfx/house.png",
    sea1: "css/game2.gfx/sea1.jpg",
    sea2: "css/game2.gfx/sea2.jpg"
  });
  var elem = $.elem( this, 'canvas' );

  console.info( "Creation of context for WebGL 2.0" );
  var gl = null;
  /*
  var gl = elem.getContext("webgl2", {
    alpha: false,
    depth: true,
    stencil: false,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    failIfPerformanceCaveat: false
  });*/
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
  DB.propAddClass( this, 'fullscreen' );

  opts = DB.extend({
    visible: true,
    fullscreen: false,
    resolution: 1,
    width: "100%",
    height: "100%"
  }, opts, this);

  var that = this;
  splashPromise.then(function( assets ) {
    play.call( that, assets );
  });
};


module.exports = Game2;




function play( assets ) {  
  var gl = this._gl;

  var runtime = new Runtime( gl, this.resolution, assets );
  
  // Blending mode to take advantage of semi-transparence of images in
  // the atlas.
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
  gl.blendEquation(gl.FUNC_ADD);

  // Only pixels  with a Z  between -1 and  +1 are displayed.  Lower Z
  // pixels hide greater  one. That means that -1 if  in the front, +1
  // in the back and 0.45812 somewhere between font and back.
  gl.enable( gl.DEPTH_TEST );
  gl.depthFunc( gl.LEQUAL );

  var anim = function( absoluteTime ) {
    requestAnimationFrame( anim );
    if( runtime.pause ) return;
    
    // Time management.
    if( runtime.lastTime === -1 ) {
      runtime.baseTime = absoluteTime;
      runtime.lastTime = absoluteTime;
      runtime.setNextSequence( "Init" );
      return;
    }
    runtime.time = absoluteTime - runtime.baseTime;
    runtime.delta = absoluteTime - runtime.lastTime;
    runtime.lastTime = absoluteTime;
    runtime.absoluteTime = absoluteTime;

    Resize( gl, 1 );

    // Check GamePads.
    Controls.loop( runtime.time, runtime.delta );
    // Execute the current sequence.
    runtime.sequence( runtime );
  };
  requestAnimationFrame( anim );
}
