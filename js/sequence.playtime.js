/** @module sequence.playtime */require( 'sequence.playtime', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var Monster = require("jumper.monster");
var Sequence = require("sequence");


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
          monsterDef.col, monsterDef.row,
          level, playground,
          monsterDef.duration, hero,
          function() {
            // The monsters ate the hero.
            // @TODO
            console.log( "Miam!" );
          }
        )
      );
    }
  }

  Sequence.paint( runtime, zoomLegend, zoomPlayground );

  if( level.isDone() ) {
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
 * @module sequence.playtime
 * @see module:$
 * @see module:jumper.monster
 * @see module:sequence

 */
});