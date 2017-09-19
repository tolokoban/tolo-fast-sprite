"use strict";




var LEVELS = {
  qbert1: {
    map: [
      "    2 1 2    ",
      "     1 1     ",
      "    1 2 1    ",
      "   1 2 2 1   ",
      "  1 2 0 2 1  ",
      " 1 2     2 1 ",
      "1 1       1 1",
      " 1 2[    2]1 ",
      "  1 2[0 2]1  ",
      "   1 2[2]1   ",
      "    1 2v1    ",
      "     1 1     ",
      "    2 1 2    "
    ],
    tr: [2,0,1],
    hero: { row: 4, col: 6 }
  }
};


function Level( name ) {
  var level = normalize( LEVELS[name] );
  this._level = level;
  var map = this._level.map;
  var cells = {};

  readOnly( this, "hero", level.hero );
  readOnly( this, "transformations", level.tr );
  readOnly( this, "cols", level.map[0].length );
  readOnly( this, "rows", level.map.length );
}

Level.prototype.moveNE = function() {
  var hero = this._level.hero;
  hero.col++;
  hero.row--;
};

Level.prototype.moveNW = function() {
  var hero = this._level.hero;
  hero.col--;
  hero.row--;
};

Level.prototype.moveSE = function() {
  var hero = this._level.hero;
  hero.col++;
  hero.row++;
};

Level.prototype.moveSW = function() {
  var hero = this._level.hero;
  hero.col--;
  hero.row++;
};

Level.prototype.canMoveNE = function(col, row) {
  var hero = this._level.hero;
  var fence = this.getFence( col + 1, row - 1 );
  if( fence === 0 || fence === 2 ) return false;
  if( this.getValue( col + 1, row - 1 ) < 0 ) return false;
  return true;
};

Level.prototype.canMoveNW = function(col, row) {
  var hero = this._level.hero;
  var fence = this.getFence( col - 1, row - 1 );
  if( fence === 1 || fence === 2 ) return false;
  if( this.getValue( col - 1, row - 1 ) < 0 ) return false;
  return true;
};

Level.prototype.canMoveSE = function(col, row) {
  var hero = this._level.hero;
  var fence = this.getFence( col, row );
  if( fence === 1 || fence === 2 ) return false;
  if( this.getValue( col + 1, row + 1 ) < 0 ) return false;
  return true;
};

Level.prototype.canMoveSW = function(col, row) {
  var hero = this._level.hero;
  var fence = this.getFence( col, row );
  if( fence === 0 || fence === 2 ) return false;
  if( this.getValue( col - 1, row + 1 ) < 0 ) return false;
  return true;
};

/**
 * @return The value  of the cube at position (`col`,  `row`). This is
 * one of  these numbers: -1, 0,  1, 2.
 * -1 means there is no cube in that location.
 */
Level.prototype.getValue = function( col, row ) {
  if( row < 0 || row >= this.rows || col < 0 || col >= this.cols ) return -1;
  var c = this._level.map[row][col];
  return "012".indexOf( c );
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

Level.prototype.transform = function( col, row ) {
  var v = this.getValue( col, row );
  if( v < 0 ) return -1;
  var w = this._level.tr[v];
  console.log( "(" + col + "," + row + "): ", v, "->", w );
  console.log( JSON.stringify( this._level.map[row] ) );
  this._level.map[row][col] = "" + w;
  console.log( JSON.stringify( this._level.map[row] ) );
  return w;
};

/**
 * @example
 * var Levels = require("wdg.game1.levels");
 * var level = Levels("qbert");
 */
module.exports = function( name ) {
  if( !LEVELS[name] ) {
    console.error( "Level `" + name + "` doe not exist!" );
    return null;
  }

  return new Level( name );
};



function normalize( level ) {
  level = clone( level );
  // Sur les  lignes paires,  les cubes se  trouvent sur  des colonnes
  // paires. Si ce n'est pas le cas, on ajoute un espace devant chaque
  // ligne et on décale la position du hero en fonction.
  // De plus, il  faut avoir un nombre paire de  ligne (pour faciliter
  // la  création de  la représentation  graphique). Docn  si on  a un
  // nombre impair de lignes, on en rajoute une vide.
  var line = level.map[0];
  var k;
  for( k=0 ; k<line.length ; k++ ) {
    if( line.charAt( k ) != ' ' ) break;
  }

  if( k % 2 === 1 ) {
    // Le premier cube se trouve sur une colonne impaire. Il faut donc
    // ajouter un espace devant chaque ligne.
    level.map = level.map.map(function( line ) {
      return " " + line;
    });
    // Et décaler la position initiale du héro.
    level.hero.col++;
  }

  if( level.map.length %2 === 1 ) {
    // Il y a un nombre impair de ligne : on en ajoute une vide.
    line = "";
    for( k = 0 ; k < level.map[0].length ; k++ ) {
      line += " ";
    }
    level.map.push( line );
  }

  // Replace strings by arrays for faster write access.
  level.map = level.map.map(function( line ) {
    var arr = [];
    for( var i=0 ; i<line.length ; i++ ) {
      arr.push( line.charAt( i ) );
    }
    return arr;
  });

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
