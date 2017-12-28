"use strict";

var $ = require("dom");
var Msg = require("tfw.message").info;
var Hero = require("game2.hero");
var Media = require("game2.media");
var Sword = require("game2.sword");
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
  level.computeSwordCoord( runtime );
  runtime.sword.paint( runtime );
  
  var item = level.hitTest( x, z );
  if( item ) {
    runtime.pause = true;
    Media.show( item.src, runtime );
    var count = level.videoCount();
    if( count > 3 ) {
      $("text").textContent = "Encore " + count;
    }
    else if( count === 0 ) {
      $("text").textContent = "C'est toi le plus fort. Bravo !";
    }
    else {
      $("text").textContent = "Plus que " + count;
    }
  }

  var tooltip = level.getTooltip( x, z );
  if( tooltip ) Msg( tooltip );
}

sequencePlaytime.init = function( runtime ) {
  var level = Levels( 0, runtime.assets );
  runtime.level = level;
  runtime.paintWorld = level.createPainter( runtime );
  runtime.hero = new Hero( runtime.gl, runtime.assets );
  runtime.sword = new Sword( runtime.gl, runtime.assets );
  runtime.x = level.heroX;
  runtime.y = 0;
  runtime.z = level.heroZ;

  var text = $.div( "front-message", ["Trouve toutes les épées pour accéder aux cinématiques"], { id: "text" } );
  $.add( document.body, text );

  var prologue = $.div( "prologue" );
  $.add( document.body, prologue );

  $.on( prologue, function() {
    $.addClass( prologue, "hide" );
    window.setTimeout(function() {
      $.detach( prologue );      
    }, 1000);
  });
};


module.exports = sequencePlaytime;
