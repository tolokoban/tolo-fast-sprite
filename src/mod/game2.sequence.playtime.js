"use strict";

var Hero = require("game2.hero");
var Media = require("game2.media");
var Levels = require("game2.levels");
var Controls = require("game2.controls");


var SPEED = 0.0017;



function sequencePlaytime( runtime ) {
  var gl = runtime.gl;
  var level = runtime.level;
  
  // `zoom` depends on the canvas size, so the game will look almost
  // the same on different devices.
  var zoom = Math.min( gl.canvas.width, gl.canvas.height ) / 700;
  runtime.zoom = zoom;

  var x = runtime.x;
  var z = runtime.z;
  
  if( Controls.N && level.canMoveN(x,z) ) runtime.z += SPEED * runtime.delta;
  if( Controls.S && level.canMoveS(x,z) ) runtime.z -= SPEED * runtime.delta;
  if( Controls.E && level.canMoveE(x,z) ) runtime.x += SPEED * runtime.delta;
  if( Controls.W && level.canMoveW(x,z) ) runtime.x -= SPEED * runtime.delta;

  runtime.paintWorld( runtime );
  runtime.hero.paint( runtime );

  var item = level.hitTest( x, z );
  if( item ) {
    runtime.pause = true;
    Media.show( item, runtime );
  }
}

sequencePlaytime.init = function( runtime ) {
  var level = Levels( 0, runtime.assets );
  runtime.level = level;
  runtime.paintWorld = level.createPainter( runtime );
  runtime.hero = new Hero( runtime.gl, runtime.assets );
  runtime.x = level.heroX;
  runtime.y = 0;
  runtime.z = level.heroZ;
};


module.exports = sequencePlaytime;
