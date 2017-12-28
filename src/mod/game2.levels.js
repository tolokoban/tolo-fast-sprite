"use strict";


var LEVELS = [window.LEVEL];
/*
 {
 map: [
 " 000     000000                                                                                     ", // 0
 "c00T0    000d00                                                                                     ", // 1
 "00 000      0000                                                                                    ", // 2
 "0   00T00000  000                                   000000                                          ", // 3
 "00 000    00H 00D00                            000000    0000                                       ", // 4
 " 000*00  00000000000000000000000000000000    000                                                    ", // 5
 "00Ta0000A0000000000000000000000000000000000000                                                      ", // 6
 "0b00T0    00C0000000000000000000000000000                                                           ", // 7
 "00000B            000000e000000000000                                                               ", // 8
 "   00   0000    0000000H00000000000                                                                 ", // 9
 "   00  000f000   000000000000000                                                                    ", // 10
 "   00000H000    00000000000000H0000                                                                 ", // 11
 "       000g000   000000000000000                                                                    ", // 12
 "         0000000000000                                                                              "  // 13
 ],
 dat: {
 T: { img: 'tree', w: 1, h: 1.5, var: .4 },
 H: { img: 'house', w: 1.2, h: .8, var: .2 },
 A: { img: 'peopleA', w: .3, h: .5, var: .1 },
 B: { img: 'peopleB', w: .3, h: .5, var: .1 },
 C: { img: 'peopleC', w: .4, h: .4, var: .1 },
 D: { img: 'peopleD', w: .4, h: .4, var: .1 },
 "+": { img: 'spot', w: .5, h: .3, var: .1 }
 },
 itm: [
 {src: "neige.webm"},
 {src: "agathe.webm"},
 {src: "neige.webm"},
 {src: "neige.webm"}
 ]
 }
 ];
 */
LEVELS[0].dat = {
  T: { img: 'tree', w: 1, h: 1.5, var: .4 },
  H: { img: 'house', w: 1.2, h: .8, var: .2 },
  A: { img: 'peopleA', w: .3, h: .5, var: .1 },
  B: { img: 'peopleB', w: .3, h: .5, var: .1 },
  C: { img: 'peopleC', w: .4, h: .4, var: .1 },
  D: { img: 'peopleD', w: .4, h: .4, var: .1 },
  "+": { img: 'spot', w: .5, h: .3, var: .1 }
};


var World = require("game2.world");


function Level( index, assets ) {
  var that = this;

  if( typeof index !== 'number' ) index = 0;
  var level = normalize( LEVELS[index % LEVELS.length] );
  this._level = level;
  var world = new World( assets );
  this._world = world;

  this.cols = 100;
  this.rows = 14;
  var ground = level.map;
  ground.forEach(function (row, z) {
    var x, c;
    for( x = 0 ; x < row.length ; x++ ) {
      c = row.charAt( x );
      if( c === ' ' ) continue;
      world.addFloor( "grass", x, 0, z );
      if( that.getValue(x, z - 1) < 0 )
        world.addFace( "ground", x, 0, z );
      if( c === '*' ) {
        that.heroX = x + .25;
        that.heroZ = z + .25;
        continue;
      }

      var xx = rnd( x, .2 );
      var zz = rnd( z, .2 );
      var item = "abcdefghijklmnopqrstuvwxyz".indexOf( c );
      if( item > -1 ) {
        c = level.dat["+"];
        if( level.itm[item] ) {
          level.itm[item].x = xx;
          level.itm[item].z = zz + .5;
          console.info("[game2.levels] item, level.itm[item]=", item, level.itm[item]);
        }
      } else {
        c = level.dat[row.charAt( x )];
      }
      if( !c ) continue;
      world.addObj( c.img, xx, 0, zz, rnd(c.w, c.var), rnd(c.h, c.var) );
    }
  }, this);
}

Level.prototype.videoCount = function( runtime ) {
  return this._level.itm.length;
};

Level.prototype.createPainter = function( runtime ) {
  return this._world.createPainter( runtime );
};

Level.prototype.canMoveN = function(col, row) {
  return 0 === this.getValue( col, row );
};

Level.prototype.canMoveW = function(col, row) {
  return 0 === this.getValue( col - 0.5, row );
};

Level.prototype.canMoveS = function(col, row) {
  return 0 === this.getValue( col, row - 0.5 );
};

Level.prototype.canMoveE = function(col, row) {
  return 0 === this.getValue( col, row );
};

/**
 * @return The value  of the cube at position (`col`,  `row`). This is
 * one of  these numbers: -1, 0,  1, 2.
 * -1 means there is no cube in that location.
 */
Level.prototype.getValue = function( x, y ) {
  var col = Math.floor( x + .5 );
  var row = Math.floor( y + .5 );
  if( row < 0 || row >= this.rows || col < 0 || col >= this.cols ) return -1;
  var c = this._level.map[row][col];
  return c === ' ' ? -1 : 0;
};

/**
 * @return The value  of the fence at position (`col`,  `row`). This is
 * one of  these numbers:
 *  -1: no fence.
 *   0: fence on left.
 *   1: fence on right.
 *   2: fence on left and right.
 */
Level.prototype.getFence = function( col, row ) {
  if( row < 0 || row >= this.rows || col < 0 || col >= this.cols ) return -1;
  var c = this._level.map[row][col+1];
  return "[]v".indexOf( c );
};

/**
 * Transform  a cube  according  to the  transformation  rules of  the
 * level.
 * @return The new value of that cube.
 */
Level.prototype.transform = function( col, row ) {
  var v = this.getValue( col, row );
  if( v < 0 ) return -1;
  var w = this._level.tr[v];
  this._level.map[row][col] = "" + w;
  if( v != 0 && w == 0 ) this._level.todo--;
  else if( v == 0 && w != 0 ) this._level.todo++;
  return w;
};

/**
 * @return `true` if all the cubes have been turned green.
 */
Level.prototype.hitTest = function(x, z) {
  if( this._level.itm.length === 0 ) return null;

  var item = this._level.itm[0];
  var dx = Math.abs( x - item.x );
  var dz = Math.abs( z - item.z );
  var dist = dx + dz;
  if( dist < .4 ) {
    this._level.itm.shift();
    return item;
  }
  return null;
};

Level.prototype.computeSwordCoord = function( runtime ) {
  if( this._level.itm.length === 0 ) {
    runtime.swordX = 999;
    runtime.swordY = 999;
    runtime.swordZ = 999;
  } else {
    var item = this._level.itm[0];
    runtime.swordX = item.x + .45;
    runtime.swordY = .3;
    runtime.swordZ = item.z;
  }
}

/**
 * @example
 * var Levels = require("game1.levels");
 * var level = Levels("qbert");
 */
module.exports = function( index, assets ) {
  if( !LEVELS[index] ) {
    console.error( "Level `" + index + "` doe not exist!" );
    return null;
  }

  return new Level( index, assets );
};



function normalize( level ) {
  level = clone( level );
  return level;
}

function clone( v ) {
  return JSON.parse( JSON.stringify( v ) );
}


function readOnly( obj, name, value ) {
  return Object.defineProperty(
    obj, name, {
      value: value,
      writable: false,
      configurable: false,
      enumerable: true
    }
  );
}


function rnd( value, variance ) {
  if( typeof variance === 'undefined' ) variance = .2;
  return  value * (1 - variance * 0.5 + Math.random() * variance);
}
