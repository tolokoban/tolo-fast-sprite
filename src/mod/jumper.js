"use strict";

var Coords = require("coords");


/**
 * A Jumper is a sprite that jumps from a cube to another cube.
 *
 * @param {Level} opts.level - The level  object is used to check what
 * moves are allowed.
 * @param {number} opts.duration - Duration of a jump in milliseconds.
 * @param  {function(this)}  opts.onJump  -  Function  called  when  a  jump
 * starts.
 * @param {function(this)} opts.onRest - Function  called when the jumper is
 * on the ground.
 * @param {function(x,y,this)} opts.onMove - Function  called when the jumper is
 * moving  and needs  a coordinates  refresh.
 *
 */
function Jumper(opts) {
  this.U = opts.U || 0;
  this.V = opts.V || 0;
  this.col = opts.col || 0;
  this.row = opts.row || 0;
  this._level = opts.level;
  // Duration of the jump in milliseconds.
  this.duration = opts.duration || 300;
  this._onJump = opts.onJump;
  this._onRest = opts.onRest;
  this._onMove = opts.onMove;

  // -1: First instant of live.
  //  0: Rest state.
  //  1: Jumping state.
  this._isJumping = -1;
  this._startJump = 0;

  this._nextAction = null;
}

module.exports = Jumper;


Jumper.prototype.play = function( time ) {
  if( this._isJumping === -1 ) {
    // First position if jumper.
    Coords.set( this.col, this.row );
    // Spawn event onMove.
    this.onMove( Coords.x, Coords.y - 80, Coords.computeZ( 0.3 ) );
    this._isJumping = 0;
  }
  else if( this._isJumping === 1) {
    // Jumping state.
    var alpha = (time - this._startJump) / this.duration;
    if( alpha < 0 ) alpha = 0;
    else if( alpha > 1 ) alpha = 1;
    var beta = 1 - alpha;
    var col = beta * this._col0 + alpha * this._col1;
    this.col = col;
    var row = beta * this._row0 + alpha * this._row1;
    this.row = row;
    // Add a curve to simulate the jump.
    row -= 0.5 * Math.sin( Math.PI * alpha );
    // Compute screen coords.
    Coords.set( col, row );
    // Spawn event onMove.
    this.onMove( Coords.x, Coords.y - 80, Coords.computeZ( 0.3 ) );
    // Is it the end of the jump?
    if( alpha === 1 ) {
      this.col = this._col1;
      this.row = this._row1;
      this.onRest( true );
      this._isJumping = 0;
    }
  }
  else {
    // Rest state.
    if( this._nextAction ) {
      // Ther is a scheduled action.
      this._nextAction( time );
      this._nextAction = null;
      this.onJump( this );
    } else {
      this.onRest( false );
    }
  }
};

/**
 * Called as soon as a Jump starts.
 */
Jumper.prototype.onJump = function() {};
/**
 * Called while the Jumper is on the ground.
 * @param  {boolean}  justLanded  -   Jumper  has  just  landed  right
 * now. This is the first call of the rest period.
 */
Jumper.prototype.onRest = function( justLanded ) {};
/**
 * Called as soon as the location of the Jumper must be updated.
 */
Jumper.prototype.onMove = function(x, y, z) {};


/**
 * You can  schedule a move  and it will occur  as soon as  the Jumper
 * will be at rest.
 */
Jumper.prototype.scheduleMoveNE = function(u, v) {
  if( this._level.canMoveNE( this.col, this.row ) ) {
    this._nextAction = this._moveNE;
    this.U = u;
    this.V = v;
  }
};
Jumper.prototype.scheduleMoveNW = function(u, v) {
  if( this._level.canMoveNW( this.col, this.row ) ) {
    this._nextAction = this._moveNW;
    this.U = u;
    this.V = v;
  }
};
Jumper.prototype.scheduleMoveSE = function(u, v) {
  if( this._level.canMoveSE( this.col, this.row ) ) {
    this._nextAction = this._moveSE;
    this.U = u;
    this.V = v;
  }
};
Jumper.prototype.scheduleMoveSW = function(u, v) {
  if( this._level.canMoveSW( this.col, this.row ) ) {
    this._nextAction = this._moveSW;
    this.U = u;
    this.V = v;
  }
};

// ###########
// # PRIVATE #
// ###########

Jumper.prototype._moveNE = function( time ) {
  this._col0 = this.col;
  this._row0 = this.row;
  this._col1 = this.col + 1;
  this._row1 = this.row - 1;
  this._startJump = time;
  this._isJumping = 1;
};

Jumper.prototype._moveNW = function( time ) {
  this._col0 = this.col;
  this._row0 = this.row;
  this._col1 = this.col - 1;
  this._row1 = this.row - 1;
  this._startJump = time;
  this._isJumping = 1;
};

Jumper.prototype._moveSE = function( time ) {
  this._col0 = this.col;
  this._row0 = this.row;
  this._col1 = this.col + 1;
  this._row1 = this.row + 1;
  this._startJump = time;
  this._isJumping = 1;
};

Jumper.prototype._moveSW = function( time ) {
  this._col0 = this.col;
  this._row0 = this.row;
  this._col1 = this.col - 1;
  this._row1 = this.row + 1;
  this._startJump = time;
  this._isJumping = 1;
};
