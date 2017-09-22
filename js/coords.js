/** @module coords */require( 'coords', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var factorZ = 0;
var rows = 0;
var z = 0;

// Converting coordinates from level (col,row) to screen (x,y) is done
// often. We don't want to create a new object for this any time.
// @example
// coords.set( 7, 3 );
// var x = coors.x;
// var y = coors.y;
module.exports = {
  x:0, y:0,
  set: function(col, row) {
    this.x = Math.floor( 0.5 + col * 64 );
    this.y = Math.floor( 0.5 + row * 64 );
    z = 0.5 - row * factorZ;
  },
  computeZ: function( alpha ) {
    if( typeof alpha === 'undefined' ) return z;
    return z - alpha * factorZ;
  }
};


Object.defineProperty(
  module.exports, "rows", {
    get: function() { return rows; },
    set: function(v) {
      rows = v;
      factorZ = rows > 0 ? 1 / rows : 0;      
    },
    enumerable: false,
    configurable: false
  }
)


  
module.exports._ = _;
/**
 * @module coords
 * @see module:$

 */
});