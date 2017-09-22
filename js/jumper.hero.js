/** @module jumper.hero */require( 'jumper.hero', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var Jumper = require("jumper");
var Controls = require("controls");


var Hero = function( col, row, level, api, onTransform ) {
  Jumper.call( this, {
    level: level, col: col, row: row
  });
  
  this.api = api;
  this.onTransform = onTransform;
  this.refHero = api.addCellXY( 99999, 99999, 0, 3 );
};

// Inheritance from Jumper
Hero.prototype = Object.create(Jumper.prototype);
Hero.prototype.constructor = Jumper.Hero;

Hero.prototype.onMove = function(x, y, z) {
  this.api.z = z;
  this.api.updateXY(
    this.refHero,
    x, y,
    x + 128, y,
    x + 128, y + 128,
    x, y + 128
  );
};

/**
 * Controls are analysed only at rest state.
 */
Hero.prototype.onRest = function( justLanded ) {
  if( justLanded ) {
    // When the hero lands on a cube, it transforms it.
    this.onTransform( this.col, this.row );
  }

  if( Controls.NE ) this.scheduleMoveNE( 2, 3 );
  else if( Controls.NW ) this.scheduleMoveNW( 0, 3 );
  else if( Controls.SW ) this.scheduleMoveSW( 3, 3 );
  else if( Controls.SE ) this.scheduleMoveSE( 1, 3 );
};


/**
 * We need  to update the sprite  when the jump starts  to reflect the
 * moving direction.  Fortunatly, U and V are stored in this object by
 * the `scheduleMove*()` methods.
 */
Hero.prototype.onJump = function() {
  this.api.updateCell(this.refHero, this.U, this.V);
};



module.exports = Hero;


  
module.exports._ = _;
/**
 * @module jumper.hero
 * @see module:$
 * @see module:jumper
 * @see module:controls

 */
});