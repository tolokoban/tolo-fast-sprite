"use strict";




var LEVELS = {
  qbert1: {
    map: [
      "      1      ",
      "     1 1     ",
      "    1 2 1    ",
      "   1 2 2 1   ",
      "  1 2 0 2 1  ",
      " 1 2 2 2 2 1 ",
      "1 1 1 1 1 1 1"
    ],
    tr: [0,0,0],
    hero: [4, 6]
  }
};


function Level( name, fastSprite ) {
  var level = LEVELS[name];
  this._level = level;
  var map = this._level.map;
  var cells = {};

  fastSprite.clear();
  
  map.forEach(function (line, y) {
    var k, c;
    for( var x = 0 ; x < line.length ; x++ ) {
      c = line.charAt( x );
      if( "012".indexOf( c ) === -1 ) continue;
      k = x + "," + y;
      cells[k] = {
        ref: fastSprite.addCellXY( x * 64, y * 96, parseInt( c ), 0 )
      };
    }
  });
  var x = level.hero[1] * 64;
  var y = level.hero[0] * 96 - 64;
  var heroRef = fastSprite.addCellXY( x, y, 5, 0 );
  fastSprite.x = x + 64;
  fastSprite.y = y + 96;
}


module.exports = Level;
