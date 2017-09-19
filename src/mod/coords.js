"use strict";

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
  }
};


