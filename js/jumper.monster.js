/** @module jumper.monster */require( 'jumper.monster', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var Jumper = require("jumper");
var Controls = require("controls");


var Monster = function( col, row, level, api, duration, hero, onVictory ) {
  Jumper.call( this, {
    level: level, col: col, row: row, duration: duration
  });

  this.hero = hero;
  this.api = api;
  this.onVictory = onVictory;
  this.refMonster = api.addCellXY( 99999, 99999, 3, 2 );
};

// Inheritance from Jumper
Monster.prototype = Object.create(Jumper.prototype);
Monster.prototype.constructor = Jumper.Monster;

Monster.prototype.onMove = function(x, y, z) {
  this.api.z = z;
  this.api.updateXY(
    this.refMonster,
    x, y,
    x + 128, y,
    x + 128, y + 128,
    x, y + 128
  );
};

/**
 * Controls are analysed only at rest state.
 */
Monster.prototype.onRest = function( justLanded ) {
  if( near(this.col, this.hero.col) && near(this.row, this.hero.row) ) {
    this.onVictory( this );
  }
  
  var rnd = Math.random();
  if( rnd < 0.5 ) {
    if( rnd < 0.25 ) {
      this.scheduleMoveNE( 3, 2 );
    } else {
      this.scheduleMoveNW( 3, 2 );
    }
  } else {
    if( rnd < 0.75 ) {
      this.scheduleMoveSW( 3, 2 );
    } else {
      this.scheduleMoveSE( 3, 2 );
    }
  }
};


/**
 * We need  to update the sprite  when the jump starts  to reflect the
 * moving direction.  Fortunatly, U and V are stored in this object by
 * the `scheduleMove*()` methods.
 */
Monster.prototype.onJump = function() {
  this.api.updateCell(this.refMonster, this.U, this.V);
};



function near( a, b ) {
  return Math.abs( a - b ) < 0.2;
}

module.exports = Monster;


  
module.exports._ = _;
/**
 * @module jumper.monster
 * @see module:$
 * @see module:jumper
 * @see module:controls

 */
});