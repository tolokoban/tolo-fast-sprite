/** @module game1.sequence.buildlevel */require( 'game1.sequence.buildlevel', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var Hero = require("game1.jumper.hero");
var Levels = require("game1.levels");
var Coords = require("game1.coords");
var Monster = require("game1.jumper.monster");
var Sequence = require("game1.sequence");


function sequenceBuildLevel( runtime ) {
  var gl = runtime.gl;
  var playground = runtime.playground;
  var legend = runtime.legend;
  var time = runtime.time;
  var hero = runtime.hero;
  var monsters = runtime.monsters;
  var level = runtime.level;
  var resolution   = runtime.resolution;

  // `zoom` depends on the canvas size, so the game will look almost
  // the same on different devices.
  var zoomLegend = Math.min( gl.canvas.width, gl.canvas.height ) / 800;
  var zoomPlayground = zoomLegend;
  var alpha;
  if( time < 1000 ) {
    // During the first second, there is an animation of the zoom to
    // make the level popup.
    alpha = Sequence.clamp( time * 0.001, 0, 1 );
    zoomPlayground *= 0.65 * Math.sin( Math.PI * alpha ) + alpha;
  }
  if( time < 500 ) {
    zoomLegend = 0;
  }
  else if ( time < 1500 ) {
    // During the first second, there is an animation of the zoom to
    // make the level popup.
    alpha = Sequence.clamp( (time - 500) * 0.001, 0, 1 );
    zoomLegend *= 0.75 * Math.sin( Math.PI * alpha ) + alpha;
  }
  else {
    runtime.setNextSequence( "PlayTime" );
  }

  runtime.hero.play( runtime );  
  Sequence.paint( runtime, zoomLegend, zoomPlayground );  
}

/**
 * Initialization of the BuildLevel sequence.
 */
sequenceBuildLevel.init = function( runtime ) {
  console.log( "Loading level", runtime.levelIndex );
  console.info("[sequence.buildlevel] runtime.time=", runtime.time);
  runtime.level = Levels( runtime.levelIndex );
  // Initialize  `Coords.rows`  to get  a  correct  depth result  when
  // calling `computeZ`.
  Coords.rows = runtime.level.rows;

  var cubes = updatePlayground( runtime.playground, runtime.level );
  updateLegend.call( this, runtime.legend, runtime.level );

  runtime.hero = new Hero(
    runtime.level.hero.col, runtime.level.hero.row, runtime.level, runtime.playground,
    function(col, row) {
      // The hero is  asking for the transformation of  a cube because
      // it has just landed on it.
      var key = col + "," + row;
      var cube = cubes[key];
      runtime.legend.highlight( runtime.level.getValue( col, row ) );
      runtime.playground.updateCell( cube, runtime.level.transform( col, row ), 0 );
    }
  );
  runtime.hero.fireMove();

  runtime.monsters = [];
};


module.exports = sequenceBuildLevel;


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
      //legend.updateZ( ref, row === 0 ? -1 : -0.99 + idx / 600 );
    });
  };

  return legend;
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




  
module.exports._ = _;
/**
 * @module game1.sequence.buildlevel
 * @see module:$
 * @see module:game1.jumper.hero
 * @see module:game1.levels
 * @see module:game1.coords
 * @see module:game1.jumper.monster
 * @see module:game1.sequence

 */
});