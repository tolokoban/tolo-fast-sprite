/** @module wdg.game1 */require( 'wdg.game1', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

require("gfx");
var $ = require("dom");
var DB = require("tfw.data-binding");
<<<<<<< HEAD
var Hero = require("jumper.hero");
var Splash = require("splash");
var Resize = require("webgl.resize");
var Levels = require("wdg.game1.levels");
var Coords = require("coords");
var Monster = require("jumper.monster");
=======
var Splash = require("splash");
var Resize = require("webgl.resize");
var Levels = require("wdg.game1.levels");
>>>>>>> d3be58902346b13aab94b97a142da719dd926e80
var Controls = require("controls");
var FastSprite = require("webgl.fast-sprite");


<<<<<<< HEAD
=======
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


>>>>>>> d3be58902346b13aab94b97a142da719dd926e80
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
<<<<<<< HEAD
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
=======

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
>>>>>>> d3be58902346b13aab94b97a142da719dd926e80

  var anim = function( time ) {
    requestAnimationFrame( anim );

<<<<<<< HEAD
    if( lastTime === -1 ) {
      baseTime = time;
      lastTime = 0;
      return;
    }
    time -= baseTime;    
=======
    if( lastTime === 0 ) {
      baseTime = time;
      lastTime = time;
      transitionStart = time + 500;
      return;
    }
>>>>>>> d3be58902346b13aab94b97a142da719dd926e80

    var delta = time - lastTime;
    lastTime = time;

<<<<<<< HEAD
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
=======
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
>>>>>>> d3be58902346b13aab94b97a142da719dd926e80
      }
    }

    Resize( gl, resolution );

    gl.clearColor( .4, .6, 1, 0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    // Put the legend in the top-left corner.
<<<<<<< HEAD
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
    
=======
    legend.centerX = (gl.canvas.width * 0.5 - 10) / zoom;
    legend.centerY = (gl.canvas.height * 0.5 - 10) / zoom;
    legend.zoom = zoom;
    legend.paint( time );
    // Display the playground after the legend to get advantage of the
    // depth-buffer optimization.
    var alpha = clamp( (time - baseTime) * 0.001, 0, 1 );
    playground.zoom = zoom * (1.1 * Math.sin( Math.PI * alpha ) + alpha);
>>>>>>> d3be58902346b13aab94b97a142da719dd926e80
    playground.paint( time );
  };
  requestAnimationFrame( anim );
}


<<<<<<< HEAD
function createLegend( gl, atlas ) {
  return new FastSprite({
=======
function createLegend( gl, level, atlas ) {
  var legend = new FastSprite({
>>>>>>> d3be58902346b13aab94b97a142da719dd926e80
    gl: gl, atlas: atlas,
    cellSrcW: 1/8, cellSrcH: 1/8,
    cellDstW: 128, cellDstH: 128
  });
<<<<<<< HEAD
}

function updateLegend( legend, level ) {
  legend.clear();
=======

>>>>>>> d3be58902346b13aab94b97a142da719dd926e80
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


<<<<<<< HEAD
function createPlayground( gl, atlas ) {
  return new FastSprite({
=======
function createPlayground( gl, level, atlas ) {
  var playground = new FastSprite({
>>>>>>> d3be58902346b13aab94b97a142da719dd926e80
    gl: gl, atlas: atlas,
    cellSrcW: 1/8, cellSrcH: 1/8,
    cellDstW: 128, cellDstH: 128
  });
<<<<<<< HEAD
}

function updatePlayground( playground, level ) {
  playground.clear();
=======

>>>>>>> d3be58902346b13aab94b97a142da719dd926e80
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
<<<<<<< HEAD
        Coords.set( col, row );
        playground.z = 0.5 - (row + 0.9) * factorZ;
        cubes[key] = playground.addCellXY(
          Coords.x, Coords.y, fence, 2
=======
        coords.set( col, row );
        playground.z = 0.5 - (row + 0.9) * factorZ;
        cubes[key] = playground.addCellXY(
          coords.x, coords.y, fence, 2
>>>>>>> d3be58902346b13aab94b97a142da719dd926e80
        );
      }
      value = level.getValue( col, row );
      if( value > -1 ) {
        key = col + "," + row;
<<<<<<< HEAD
        Coords.set( col, row );
        playground.z = 0.5 - row * factorZ;
        cubes[key] = playground.addCellXY(
          Coords.x, Coords.y, value, 0
=======
        coords.set( col, row );
        playground.z = 0.5 - row * factorZ;
        cubes[key] = playground.addCellXY(
          coords.x, coords.y, value, 0
>>>>>>> d3be58902346b13aab94b97a142da719dd926e80
        );
      }
    }
    // Odd row.
    for( col = 1 ; col < level.cols ; col += 2 ) {
      fence = level.getFence( col, row + 1 );
      if( fence > -1 ) {
        key = "F" + col + "," + (row + 1);
<<<<<<< HEAD
        Coords.set( col, row + 1 );
        playground.z = 0.5 - (row + 1.9) * factorZ;
        cubes[key] = playground.addCellXY(
          Coords.x, Coords.y, fence, 2
=======
        coords.set( col, row + 1 );
        playground.z = 0.5 - (row + 1.9) * factorZ;
        cubes[key] = playground.addCellXY(
          coords.x, coords.y, fence, 2
>>>>>>> d3be58902346b13aab94b97a142da719dd926e80
        );
      }
      value = level.getValue( col, row + 1 );
      if( value > -1 ) {
        key = col + "," + (row + 1);
<<<<<<< HEAD
        Coords.set( col, row + 1 );
        playground.z = 0.5 - (row + 1) * factorZ;
        cubes[key] = playground.addCellXY(
          Coords.x, Coords.y, value, 0
=======
        coords.set( col, row + 1 );
        playground.z = 0.5 - (row + 1) * factorZ;
        cubes[key] = playground.addCellXY(
          coords.x, coords.y, value, 0
>>>>>>> d3be58902346b13aab94b97a142da719dd926e80
        );
      }
    }
  }

<<<<<<< HEAD
  Coords.set( level.hero.col, level.hero.row );
  playground.centerX = Coords.x;
  playground.centerY = Coords.y;

  return cubes;
=======
  coords.set( level.hero.col, level.hero.row );
  playground.centerX = coords.x;
  playground.centerY = coords.y;
  this._cubes = cubes;

  return playground;
>>>>>>> d3be58902346b13aab94b97a142da719dd926e80
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


  
module.exports._ = _;
/**
 * @module wdg.game1
 * @see module:$
 * @see module:gfx
 * @see module:dom
 * @see module:tfw.data-binding
<<<<<<< HEAD
 * @see module:jumper.hero
 * @see module:splash
 * @see module:webgl.resize
 * @see module:wdg.game1.levels
 * @see module:coords
 * @see module:jumper.monster
=======
 * @see module:splash
 * @see module:webgl.resize
 * @see module:wdg.game1.levels
>>>>>>> d3be58902346b13aab94b97a142da719dd926e80
 * @see module:controls
 * @see module:webgl.fast-sprite

 */
});