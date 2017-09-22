"use strict";

/**
 * Chaque  action est  transformée en  propriété en  lecture seule  du
 * module.
 * Il  s'agit  d'une  valeur  comprise  entre 0  et  1.  Elle  exprime
 * l'intention du  joueur qui peut  avoir utilisé le  clavier, l'écran
 * tactile, le gamepad, ...
 */
var ACTIONS = {
  NE: 0, SE: 0, SW: 0, NW: 0,
  R: 0, L: 0, U: 0, D: 0
};

// Association de touches et d'actions.
var KEYS = {
  '9': 'NE',
  '3': 'SE',
  '1': 'SW',
  '7': 'NW',
  'ArrowLeft': 'NW',
  'ArrowUp': 'NE',
  'ArrowRight': 'SE',
  'ArrowDown': 'SW'
};

var ACTIONS_keys = [];
for( var key in ACTIONS ) {
  ACTIONS_keys.push( key );
}

ACTIONS_keys.forEach(function (action) {
  Object.defineProperty( module.exports, action, {
    set: function() {},
    get: function() {
      return ACTIONS[action] || 0;
    },
    enumerable: true,
    configurable: false
  });
});

document.addEventListener("keydown", function(evt) {
  var action = getKeyboardAction( evt );
  if( action ) ACTIONS[action] = 1;
});

document.addEventListener("keyup", function(evt) {
  var action = getKeyboardAction( evt );
  if( action ) ACTIONS[action] = 0;
});

/**
 * @return L'action associée à la touche qui a déclenché l'événement.
 */
function getKeyboardAction( evt ) {
  var key = evt.key;
  var action = KEYS[key];
  console.info("[controls] key=", key, action);
  if( action ) {
    evt.preventDefault();
  }
  return action;
}


module.exports.loop = function( time, delta ) {
  var gamepads = navigator.getGamepads ? navigator.getGamepads()
        : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  if( !gamepads ) return;
  var pad = gamepads[0];
  if( !pad ) return;

  var h = pad.axes[0];
  var v = pad.axes[1];

  ACTIONS.NE = ACTIONS.NW = ACTIONS.SE = ACTIONS.SW = 0;
  if( Math.abs(h) < .1 || Math.abs(v) < .1 ) return;

  if( h > 0 ) {
    // Right.
    if( v > 0 ) {
      // Down.
      ACTIONS.SE = 1;
    } else {
      // Up.
      ACTIONS.NE = 1;
    }
  } else {
    // Left.
    if( v > 0 ) {
      // Down.
      ACTIONS.SW = 1;      
    } else {
      // Up.
      ACTIONS.NW = 1;
    }
  }

/*
  pad.axes.forEach(function (axe, idx) {
    if( axe === 0 ) return;
    console.info("[controls] idx, axe=", idx, axe);
  });
*/
};


window.addEventListener("gamepadconnected", function(e) {
  console.info("[controls] e.gamepad=", e.gamepad);

});
