"use strict";

var Jumper = require("game1.jumper");
var Coords = require("game1.coords");
var Controls = require("game1.controls");

/**
 * The monster AI is a simple rules automate.
 * If the  hero is  in a  straight line  from the  monster and  if the
 * movement is possible,  go in the direction of  the hero. Otherwise,
 * keep going in the current direction until possible. If stoped, take
 * a random direction avoiding to get back.
 */
var Monster = function( col, row, level, api, duration, hero, onVictory ) {
  var that = this;

  Jumper.call( this, {
    level: level, col: col, row: row, duration: duration
  });

  this.hero = hero;
  this.api = api;
  this.onVictory = onVictory;
  this.refMonster = api.addCellXY( 99999, 99999, 3, 2 );

  // Used for A.I.
  this.NE = {
    dir: "NE",
    canMove: function() { return level.canMoveNE( that.col, that.row ); },
    move: function() { that.scheduleMoveNE( 3, 2 ); },
    sideDir: ["NW", "SE"],
    backDir: "SW"
  };
  this.NW = {
    dir: "NW",
    canMove: function() { return level.canMoveNW( that.col, that.row ); },
    move: function() { that.scheduleMoveNW( 3, 2 ); },
    sideDir: ["NE", "SW"],
    backDir: "SE"
  };
  this.SE = {
    dir: "SE",
    canMove: function() { return level.canMoveSE( that.col, that.row ); },
    move: function() { that.scheduleMoveSE( 3, 2 ); },
    sideDir: ["NE", "SW"],
    backDir: "NW"
  };
  this.SW = {
    dir: "SW",
    canMove: function() { return level.canMoveSW( that.col, that.row ); },
    move: function() { that.scheduleMoveSW( 3, 2 ); },
    sideDir: ["NW", "SE"],
    backDir: "NE"
  };

  this.dir = this.SE;
  this._birth = -1;
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
  var birth = this._birth;
  var runtime = this.runtime;

  if( birth < 0 ) {
    this._birth = runtime.time;
    return;
  }

  var life = runtime.time - birth;
  var warming = 2000;
  if( life < warming ) {
    // Before the firt  jump, the monster has to warm-up.  The idea is
    // to warn to hero that a monster is arriving.
    console.info("[game1.jumper.monster] life=", life);
    Coords.set( this.col, this.row );
    var x = Coords.x + 64;
    var y = Coords.y + 64 - 80;
    var ang = Math.PI * life * 0.002;
    var radius = 90;
    if( life < warming * 0.5 ) {
      radius *= 2 * life / warming;
    }
    var vx = radius * Math.cos( ang );
    var vy = radius * Math.sin( ang );
    var r1 = 1 + 0.2 * Math.cos( life * 0.025 + 0 );
    var r2 = 1 + 0.2 * Math.cos( life * 0.027 + 1 );
    var r3 = 1 + 0.2 * Math.cos( life * 0.029 + 2 );
    var r4 = 1 + 0.2 * Math.cos( life * 0.023 + 3 );
    this.api.z = Coords.z;
    this.api.updateXY(
      this.refMonster,
      x + r1 * vx, y + r1 * vy,
      x + r2 * vy, y - r2 * vx,
      x - r3 * vx, y - r3 * vy,
      x - r4 * vy, y + r4 * vx
    );
    return;
  }

  if( near(this.col, this.hero.col) && near(this.row, this.hero.row) ) {
    this.onVictory( this );
  }

  this.dir = findBestDirection.call( this );
  if( this.dir.canMove() ) {
    this.dir.move();
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


function findBestDirection() {
  var candidateDir;
  // Look if we have the hero in a straight line.
  var deltaCol = this.hero.col - this.col;
  var deltaRow = this.hero.row - this.row;
  if( Math.abs(deltaCol) === Math.abs(deltaRow) ) {
    // Yes! We have to find the direction now.
    if( deltaCol > 0 ) {
      // East.
      if( deltaRow > 0 ) {
        // South.
        candidateDir = this.SE;
      } else {
        // North.
        candidateDir = this.NE;
      }
    } else {
      // West.
      if( deltaRow > 0 ) {
        // South.
        candidateDir = this.SW;
      } else {
        // North.
        candidateDir = this.NW;
      }
    }

    if( candidateDir.canMove() ) {
      return candidateDir;
    }
  }

  // The hero is not in sight, so we try to keep going.
  if( this.dir.canMove() ) return this.dir;

  // Some   obstacle  prevent   the  monster   to  continue   in  that
  // direction. It will try a sideway.
  if( Math.random() < .5 ) {
    // Choose the first sideway at random.
    var tmp = this.dir.sideDir[0];
    this.dir.sideDir[0] = this.dir.sideDir[1];
    this.dir.sideDir[1] = tmp;
  }
  candidateDir = this[this.dir.sideDir[0]];
  if( candidateDir.canMove() ) return candidateDir;
  candidateDir = this[this.dir.sideDir[1]];
  if( candidateDir.canMove() ) return candidateDir;
  return this[this.dir.backDir];
}


function near( a, b ) {
  return Math.abs( a - b ) < 0.2;
}

module.exports = Monster;
