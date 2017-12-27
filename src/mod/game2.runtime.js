"use strict";

var sequences = {
  Init: require("game2.sequence.init"),
  PlayTime: require("game2.sequence.playtime")
};


function Runtime( gl, resolution, assets ) {
  // Level index.
  this.levelIndex = 0;
  // Current level.
  this.level = null;
  // WebGL.
  this.gl = gl;
  this.resolution = resolution;
  this.assets = assets;
  // Characters.
  this.hero = null;
  this.monsters = null;
  // These  three  variables  are  used  internally  to  manage  the
  // relative time and delta used in a sequence.
  this.absoluteTime = 0;
  this.baseTime = 0;
  this.lastTime = -1;
  // Time relative to the beginning of the sequence.
  this.time = 0;
  // Delta time between two subsequent calls of animationFrame.
  this.delta = 0;
  // The  sequence is  a function  which  will be  called with  this
  // runtime.
  this.sequence = null;
  // Object used as a context for current sequence.
  this.context = {};
};


Runtime.prototype.setNextSequence = function( sequenceName ) {
  var sequence = sequences[sequenceName];
  if( typeof sequence !== 'function' ) {
    throw Error("Unknown sequence name: " + sequenceName);
  }
  console.log( "Next sequence: ", sequenceName );
  this.sequence = sequence;
  // The time of a new sequence always starts at zero.
  this.baseTime = this.absoluteTime;
  this.deltaTime = 0;
  this.time = 0;
  if( typeof sequence.init === 'function' ) {
    // There is an initialization function for this sequence.
    sequence.init( this );
  }
};



module.exports = Runtime;
