/** @module game1.sequence.playtime */require( 'game1.sequence.playtime', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var Err = require("tfw.message").error;
var Msg = require("tfw.message").info;
var Monster = require("game1.jumper.monster");
var Sequence = require("game1.sequence");


function sequencePlaytime( runtime ) {
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

  // Manage Hero moves and controls.
  hero.play( runtime );
  // Manage Monsters moves and controls.
  monsters.forEach(function (monster) {
    monster.play( runtime );
  });

  if( level.monsters.length > 0 ) {
    var monsterDef = level.monsters[0];
    if( monsterDef.birth < time ) {
      // Birth of a new monster.
      level.monsters.shift();
      monsters.push(
        new Monster(
          monsterDef.col, monsterDef.row,
          level, playground,
          monsterDef.duration, hero,
          function() {
            // The monsters ate the hero.
            Err("Miam, miam! You're dead...");
            runtime.setNextSequence( "BuildLevel" );
          }
        )
      );
    }
  }

  Sequence.paint( runtime, zoomLegend, zoomPlayground );

  if( level.isDone() ) {
    Msg("Congratulation!!");
    runtime.levelIndex++;
    runtime.setNextSequence( "BuildLevel" );
  }
}

sequencePlaytime.init = function( runtime ) {
  runtime.hero.fireMove();
};


module.exports = sequencePlaytime;


  
module.exports._ = _;
/**
 * @module game1.sequence.playtime
 * @see module:$
 * @see module:tfw.message
 * @see module:game1.jumper.monster
 * @see module:game1.sequence

 */
});