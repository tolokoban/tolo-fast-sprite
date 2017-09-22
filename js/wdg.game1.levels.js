/** @module wdg.game1.levels */require( 'wdg.game1.levels', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";




var LEVELS = [
  {
    map: [
      "   1   ",
      "  1 1  ",
      " 1 1 1 ",
      "1 1 1 1"
    ],
    tr: [0,0,0],
    hero: { col: 3, row: 0 },
    monsters: [
      { col: 3, row: 0, birth: 30000, duration: 600 },
    ]
  },
  {
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
    hero: { row: 4, col: 6 },
    monsters: [
      { row: 0, col: 6, birth: 15000, duration: 1000 },
      { row: 12, col: 6, birth: 30000, duration: 800 },
    ]
  }
];


function Level( index ) {
  if( typeof index !== 'number' ) index = 0;
  var level = normalize( LEVELS[index % LEVELS.length] );
  this._level = level;
  var map = this._level.map;
  var cells = {};

  readOnly( this, "hero", level.hero );
  readOnly( this, "transformations", level.tr );
  readOnly( this, "cols", level.map[0].length );
  readOnly( this, "rows", level.map.length );
  readOnly( this, "monsters", level.monsters || [] );
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
  return w;
};

/**
 * @return `true` if all the cubes have been turned green.
 */
Level.prototype.isDone = function() {
  return this._level.todo <= 0;
};

/**
 * @example
 * var Levels = require("wdg.game1.levels");
 * var level = Levels("qbert");
 */
module.exports = function( index ) {
  if( !LEVELS[index] ) {
    console.error( "Level `" + index + "` doe not exist!" );
    return null;
  }

  return new Level( index );
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

  if( !Array.isArray( level.monsters ) ) level.monsters = [];
  
  if( k % 2 === 1 ) {
    // Le premier cube se trouve sur une colonne impaire. Il faut donc
    // ajouter un espace devant chaque ligne.
    level.map = level.map.map(function( line ) {
      return " " + line;
    });
    // Et décaler la position initiale du héro et des monstres.
    level.hero.col++;
    level.monsters.forEach(function (monster) {
      monster.col++;
    });
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

  // `todo`  is the  number  of cubes  that still  need  to be  turned
  // green. The hero win as soon as this value is zero.
  level.todo = 0;
  level.map.forEach(function (line) {
    line.forEach(function (cell) {
      if( "12".indexOf( cell ) > -1 ) {
        level.todo++;
      }
    });
  });

  console.info("[wdg.game1.levels] level=", level);
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


  
module.exports._ = _;
/**
 * @module wdg.game1.levels
 * @see module:$

 */
});