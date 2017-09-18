"use strict";

require("gfx");
var $ = require("dom");
var DB = require("tfw.data-binding");
var Splash = require("splash");
var Resize = require("webgl.resize");
var Levels = require("wdg.game1.levels");
var Controls = require("controls");
var FastSprite = require("webgl.fast-sprite");


// Converting coordinates from level (col,row) to screen (x,y) is done
// often. We don't want to create a new object for this any time.
// @example
// coords.set( 7, 3 );
// var x = coors.x;
// var y = coors.y;
var coords = {
  x:0, y:0,
  set: function(col, row) {
    this.x = Math.floor( 0.5 + col * 64 );
    this.y = Math.floor( 0.5 + row * 64 );
  }
};


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
  var splashPromise = Splash({ atlas: "css/gfx/qbert.png" });
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
  DB.propAddClass( this, 'fullscreen' );

  opts = DB.extend({
    visible: true,
    fullscreen: false,
    resolution: 1,
    width: "100%",
    height: "100%"
  }, opts, this);

  var that = this;
  splashPromise.then(function( images ) {
    play.call( that, images.atlas );
  });
};


module.exports = Game1;




function play( atlas ) {
  var gl = this._gl;
  var resolution = this.resolution;

  Resize( gl, resolution );

  var level = Levels( "qbert1" );
  var factorZ = 1 / level.rows;
  var heroSrc = { col: level.hero.col, row: level.hero.row };
  var heroDst = { col: level.hero.col, row: level.hero.row };
  // A transition is a period of  time during which the game goes from
  // one state  to the next one.  The hero's motion animation  is made
  // during the  transition and the  controls are only read  before or
  // after any transition.
  var transitionDuration = 500;  // Milliseconds.
  var transitionStart = 0;       // Milliseconds.
  var baseTime = 0;

  var legend = createLegend( gl, level, atlas );
  var playground = createPlayground.call( this, gl, level, atlas );
  var cubes = this._cubes;

  coords.set( heroSrc.col, heroSrc.row );
  playground.z = 0.5 - (heroSrc.row + 0.2) * factorZ;
  var heroRef = playground.addCellXY( coords.x, coords.y - 80, 5, 0 );

  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
  gl.blendEquation(gl.FUNC_ADD);
  
  gl.enable( gl.DEPTH_TEST );
  gl.depthFunc( gl.LEQUAL );

  var lastTime = 0;
  var jumping = false;

  var anim = function( time ) {
    requestAnimationFrame( anim );

    if( lastTime === 0 ) {
      baseTime = time;
      lastTime = time;
      transitionStart = time + 500;
      return;
    }

    var delta = time - lastTime;
    lastTime = time;

    var zoom = Math.min( gl.canvas.width, gl.canvas.height ) / 800;

    var speed = 0.3 * delta;
    if( Controls.R ) {
      playground.centerX += speed;
    }
    if( Controls.L ) {
      playground.centerX -= speed;
    }
    if( Controls.D ) {
      playground.centerY += speed;
    }
    if( Controls.U ) {
      playground.centerY -= speed;
    }

    var transitionAlpha = clampTransition( time, transitionStart, transitionDuration );
    var col = (1 - transitionAlpha) * heroSrc.col + transitionAlpha * heroDst.col;
    var row = (1 - transitionAlpha) * heroSrc.row + transitionAlpha * heroDst.row;
    coords.set( col, row );
    playground.centerX = coords.x;
    playground.centerY = coords.y;

    playground.z = 0.5 - (row + 0.2) * factorZ;
    row -= 0.5 * Math.sin( Math.PI * transitionAlpha );
    coords.set( col, row );
    coords.y -= 80;
    playground.updateXY(
      heroRef,
      coords.x, coords.y,
      coords.x + 128, coords.y,
      coords.x + 128, coords.y +128,
      coords.x, coords.y + 128
    );

    if( transitionAlpha === 1 ) {
      heroSrc.col = level.hero.col;
      heroSrc.row = level.hero.row;
      if( jumping ) {
        // Transform the cube where the hero lands.
        jumping = false;
        var key = level.hero.col + "," + level.hero.row;
        var cube = cubes[key];
        legend.highlight( level.getValue( level.hero.col, level.hero.row ) );
        playground.updateCell( cube, level.transform( level.hero.col, level.hero.row ), 0 );
      }
      if( Controls.NE && level.canMoveNE() ) {
        level.moveNE();
        heroDst.col = level.hero.col;
        heroDst.row = level.hero.row;
        transitionStart = time;
        playground.updateCell( heroRef, 6, 0 );
        jumping = true;
      }
      else if( Controls.NW && level.canMoveNW() ) {
        level.moveNW();
        heroDst.col = level.hero.col;
        heroDst.row = level.hero.row;
        transitionStart = time;
        playground.updateCell( heroRef, 4, 0 );
        jumping = true;
      }
      else if( Controls.SW && level.canMoveSW() ) {
        level.moveSW();
        heroDst.col = level.hero.col;
        heroDst.row = level.hero.row;
        transitionStart = time;
        playground.updateCell( heroRef, 7, 0 );
        jumping = true;
      }
      else if( Controls.SE && level.canMoveSE() ) {
        level.moveSE();
        heroDst.col = level.hero.col;
        heroDst.row = level.hero.row;
        transitionStart = time;
        playground.updateCell( heroRef, 5, 0 );
        jumping = true;
      }
    }

    Resize( gl, resolution );

    gl.clearColor( .4, .6, 1, 0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    // Put the legend in the top-left corner.
    legend.centerX = (gl.canvas.width * 0.5 - 10) / zoom;
    legend.centerY = (gl.canvas.height * 0.5 - 10) / zoom;
    legend.zoom = zoom;
    legend.paint( time );
    // Display the playground after the legend to get advantage of the
    // depth-buffer optimization.
    var alpha = clamp( (time - baseTime) * 0.001, 0, 1 );
    playground.zoom = zoom * (1.1 * Math.sin( Math.PI * alpha ) + alpha);
    playground.paint( time );
  };
  requestAnimationFrame( anim );
}


function createLegend( gl, level, atlas ) {
  var legend = new FastSprite({
    gl: gl, atlas: atlas,
    cellSrcW: 1/8, cellSrcH: 1/8,
    cellDstW: 128, cellDstH: 128
  });

  var sprites = [];
  legend.z = -1;
  level.transformations.forEach(function (dst, src) {
    sprites.push([
      legend.addScaledCellXY( 0, src * 32, src, 1, 0.5 ), src
    ]);
    sprites.push([
      legend.addScaledCellXY( 70, src * 32 + 10, 3, 1, 0.3 ), 3
    ]);
    sprites.push([
      legend.addScaledCellXY( 70 * 1.6, src * 32, dst, 1, 0.5 ), dst
    ]);
  });

  /**
   * @param {number} value - 0, 1 or 2. tEH row to highlight.
   */
  legend.highlight = function( value ) {
    sprites.forEach(function (sprite, idx) {
      var ref = sprite[0];
      var col = sprite[1];
      var row = Math.floor( idx / 3 ) === value ? 0 : 1;
      legend.updateCell( ref, col, row );
      legend.updateZ( ref, row === 0 ? -1 : -0.99 + idx / 600 );
    });
  };

  return legend;
}


function createPlayground( gl, level, atlas ) {
  var playground = new FastSprite({
    gl: gl, atlas: atlas,
    cellSrcW: 1/8, cellSrcH: 1/8,
    cellDstW: 128, cellDstH: 128
  });

  var cubes = {};
  var col, row;
  var key, value, fence;
  // The depth is used to hide the hero behind fences.
  var factorZ = 1 / level.rows;
  for( row = 0 ; row < level.rows ; row += 2 ) {
    // Even row.
    for( col = 0 ; col < level.cols ; col += 2 ) {
      fence = level.getFence( col, row );
      if( fence > -1 ) {
        key = "F" + col + "," + row;
        coords.set( col, row );
        playground.z = 0.5 - (row + 0.9) * factorZ;
        cubes[key] = playground.addCellXY(
          coords.x, coords.y, fence, 2
        );
      }
      value = level.getValue( col, row );
      if( value > -1 ) {
        key = col + "," + row;
        coords.set( col, row );
        playground.z = 0.5 - row * factorZ;
        cubes[key] = playground.addCellXY(
          coords.x, coords.y, value, 0
        );
      }
    }
    // Odd row.
    for( col = 1 ; col < level.cols ; col += 2 ) {
      fence = level.getFence( col, row + 1 );
      if( fence > -1 ) {
        key = "F" + col + "," + (row + 1);
        coords.set( col, row + 1 );
        playground.z = 0.5 - (row + 1.9) * factorZ;
        cubes[key] = playground.addCellXY(
          coords.x, coords.y, fence, 2
        );
      }
      value = level.getValue( col, row + 1 );
      if( value > -1 ) {
        key = col + "," + (row + 1);
        coords.set( col, row + 1 );
        playground.z = 0.5 - (row + 1) * factorZ;
        cubes[key] = playground.addCellXY(
          coords.x, coords.y, value, 0
        );
      }
    }
  }

  coords.set( level.hero.col, level.hero.row );
  playground.centerX = coords.x;
  playground.centerY = coords.y;
  this._cubes = cubes;

  return playground;
}


/**
 * A transition  starts at `start`  and has a duration  of `duration`.
 * This function returns a number between  0 and 1 depending on `time`
 * in the range [start, duration].
 */
function clampTransition( time, start, duration ) {
  if( duration < 0.0001 ) return 0;
  if( time < start ) return 0;
  if( time > start + duration ) return 1;
  return (time - start) / duration;
}

function clamp(v, min, max) {
  if( v > max ) return max;
  if( v < min ) return min;
  return v;
}
