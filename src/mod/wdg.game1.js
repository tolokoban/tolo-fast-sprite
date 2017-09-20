"use strict";

require("gfx");
var $ = require("dom");
var DB = require("tfw.data-binding");
var Hero = require("jumper.hero");
var Splash = require("splash");
var Resize = require("webgl.resize");
var Levels = require("wdg.game1.levels");
var Coords = require("coords");
var Monster = require("jumper.monster");
var Controls = require("controls");
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
  var playground = createPlayground( gl, atlas );
  var legend = createPlayground( gl, atlas );
  var levelIndex = 0;

  var level = Levels( levelIndex );
  // Initialize  `Coords.rows`  to get  a  correct  depth result  when
  // calling `computeZ`.
  Coords.rows = level.rows;

  var cubes = updatePlayground( playground, level );
  updateLegend.call( this, legend, level );

  var hero = new Hero(
    level.hero.col, level.hero.row, level, playground,
    function(col, row) {
      // The hero is  asking for the transformation of  a cube because
      // it has just landed on it.
      var key = col + "," + row;
      var cube = cubes[key];
      legend.highlight( level.getValue( col, row ) );
      playground.updateCell( cube, level.transform( col, row ), 0 );
    }
  );

  var monsters = [];

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


  // The time when the game has  started is stored in `baseTime`. This
  // is used for start animation  and for monsters/bonus arrivals. The
  // `lastTime`  is  used to  compute  the  `delta`between two  screen
  // refreshes.
  var baseTime = 0;
  var lastTime = -1;
  var delta;

  var anim = function( time ) {
    requestAnimationFrame( anim );

    if( lastTime === -1 ) {
      baseTime = time;
      lastTime = 0;
      return;
    }
    time -= baseTime;    

    var delta = time - lastTime;
    lastTime = time;

    // `zoom` depends on the canvas size, so the game will look almost
    // the same on different devices.
    var zoomLegend = Math.min( gl.canvas.width, gl.canvas.height ) / 800;
    var zoomPlayground = zoomLegend;
    var alpha;
    if( time < 1000 ) {
      // During the first second, there is an animation of the zoom to
      // make the level popup.
      alpha = clamp( time * 0.001, 0, 1 );
      zoomPlayground *= 0.65 * Math.sin( Math.PI * alpha ) + alpha;
    }
    if( time < 500 ) {
      zoomLegend = 0;
    }
    else if ( time < 1500 ) {
      // During the first second, there is an animation of the zoom to
      // make the level popup.
      alpha = clamp( (time - 500) * 0.001, 0, 1 );
      zoomLegend *= 0.75 * Math.sin( Math.PI * alpha ) + alpha;
    }


    // Manage Hero moves and controls.
    hero.play( time );
    // Manage Monsters moves and controls.
    monsters.forEach(function (monster) {
      monster.play( time );
    });

    if( level.monsters.length > 0 ) {
      var monsterDef = level.monsters[0];
      if( monsterDef.birth < time ) {
        // Birth of a new monster.
        level.monsters.shift();
        monsters.push(
          new Monster(
            monsterDef.col, monsterDef.row, level, playground, monsterDef.duration, hero,
            function() {
              // The monsters ate the hero.
              // @TODO
              console.log( "Miam!" );
            }
          )
        );
      }
    }

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
  requestAnimationFrame( anim );
}


function createLegend( gl, atlas ) {
  return new FastSprite({
    gl: gl, atlas: atlas,
    cellSrcW: 1/8, cellSrcH: 1/8,
    cellDstW: 128, cellDstH: 128
  });
}

function updateLegend( legend, level ) {
  legend.clear();
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


function createPlayground( gl, atlas ) {
  return new FastSprite({
    gl: gl, atlas: atlas,
    cellSrcW: 1/8, cellSrcH: 1/8,
    cellDstW: 128, cellDstH: 128
  });
}

function updatePlayground( playground, level ) {
  playground.clear();
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
        Coords.set( col, row );
        playground.z = 0.5 - (row + 0.9) * factorZ;
        cubes[key] = playground.addCellXY(
          Coords.x, Coords.y, fence, 2
        );
      }
      value = level.getValue( col, row );
      if( value > -1 ) {
        key = col + "," + row;
        Coords.set( col, row );
        playground.z = 0.5 - row * factorZ;
        cubes[key] = playground.addCellXY(
          Coords.x, Coords.y, value, 0
        );
      }
    }
    // Odd row.
    for( col = 1 ; col < level.cols ; col += 2 ) {
      fence = level.getFence( col, row + 1 );
      if( fence > -1 ) {
        key = "F" + col + "," + (row + 1);
        Coords.set( col, row + 1 );
        playground.z = 0.5 - (row + 1.9) * factorZ;
        cubes[key] = playground.addCellXY(
          Coords.x, Coords.y, fence, 2
        );
      }
      value = level.getValue( col, row + 1 );
      if( value > -1 ) {
        key = col + "," + (row + 1);
        Coords.set( col, row + 1 );
        playground.z = 0.5 - (row + 1) * factorZ;
        cubes[key] = playground.addCellXY(
          Coords.x, Coords.y, value, 0
        );
      }
    }
  }

  Coords.set( level.hero.col, level.hero.row );
  playground.centerX = Coords.x;
  playground.centerY = Coords.y;

  return cubes;
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
