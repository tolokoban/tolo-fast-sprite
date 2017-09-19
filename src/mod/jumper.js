"use strict";

var Coords = require("coords");


/**
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
  this.col = opts.col ||0;
  this.row = opts.row ||0;
  this._level = opts.level;
  // Duration of the jump in milliseconds.
  this.duration = opts.duration || 300;
  this._onJump = opts.onJump;
  this._onRest = opts.onRest;
  this._onMove = opts.onMove;

  this._isJumping = false;
  this._startJump = 0;
  
  this._nextAction = null;

  this._moveNE = moveNE.bind( this );
  this._moveNW = moveNW.bind( this );
  this._moveSE = moveSE.bind( this );
  this._moveSW = moveSW.bind( this );
}

module.exports = Jumper;


Jumper.prototype.play = function( time ) {
  if( this._isJumping ) {
    // Jumping state.
    var alpha = (time - this._startJump) / this.duration;
    if( alpha < 0 ) alpha = 0;
    else if( alpha > 1 ) alpha = 1;
    var beta = 1 - alpha;
    var col = beta * this._col0 + alpha * this._col1;
    var row = beta * this._row0 + alpha * this._row1;
    // Add a curve to simulate the jump.
    row -= 0.5 * Math.sin( Math.PI * alpha );
    // Compute screen coords.
    Coords.set( col, row );
    // Spawn event onMove.
    this.onMove( Coords.x, Coords.y - 80, this );
    // Is it the end of the jump?
    if( alpha === 1 ) {
      this._onRest( this );
    }
  } else {
    // Rest state.
    if( this._nextAction ) {
      // Ther is a scheduled action.
      this._nextAction( time );
      this._nextAction = null;
      this._onJump( this );
    }
  }
};


/**
 * You can  schedule a move  and it will occur  as soon as  the Jumper
 * will be at rest.
 */
Jumper.prototype.scheduleMoveNE = function() {
  if( this._level.canMoveNE( this.col, this.row ) ) {
    this._nextAction = this._moveNE;
  }
};
Jumper.prototype.scheduleMoveNW = function() {
  if( this._level.canMoveNW( this.col, this.row ) ) {
    this._nextAction = this._moveNW;
  }
};
Jumper.prototype.scheduleMoveSE = function() {
  if( this._level.canMoveSE( this.col, this.row ) ) {
    this._nextAction = this._moveSE;
  }
};
Jumper.prototype.scheduleMoveSW = function() {
  if( this._level.canMoveSW( this.col, this.row ) ) {
    this._nextAction = this._moveSW;
  }
};

// ###########
// # PRIVATE #
// ###########

function moveNE( time ) {
  this._col0 = this.col;
  this._row0 = this.row;
  this.col++;
  this.row--;
  this._col1 = this.col;
  this._row1 = this.row;
  this._startJump = time;
  this._isJumping = true;
};

function moveNW( time ) {
  this._col0 = this.col;
  this._row0 = this.row;
  this.col--;
  this.row--;
  this._col1 = this.col;
  this._row1 = this.row;
  this._startJump = time;
  this._isJumping = true;
};

function moveSE( time ) {
  this._col0 = this.col;
  this._row0 = this.row;
  this.col++;
  this.row++;
  this._col1 = this.col;
  this._row1 = this.row;
  this._startJump = time;
  this._isJumping = true;
};

function moveSW( time ) {
  this._col0 = this.col;
  this._row0 = this.row;
  this.col--;
  this.row++;
  this._col1 = this.col;
  this._row1 = this.row;
  this._startJump = time;
  this._isJumping = true;
};
