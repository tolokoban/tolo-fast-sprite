"use strict";

var Jumper = require("jumper");

var Hero = function( col, row, level, api ) {
  var jumper = new Jumper({
    level: level, col: col, row: row,
    onMove: onMove.bind( this ),
    onJump: onJump.bind( this ),
    onRest: onRest.bind( this )
  });

  this.col = col;
  this.row = row;
  this._jumper = jumper;
  this._api = api;
  this._refHero = api.addCellXY( 99999, 99999, 5, 0 );
};


function onMove(x, y) {
  this._api.update(
    this._refHero,
    x, y,
    x + 128, y,
    x + 128, y + 128,
    x, y + 128
  );
}

function onRest() {

}

function onJump() {

}
