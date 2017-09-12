"use strict";

/**
 * Chaque  action est  transformée en  propriété en  lecture seule  du
 * module.
 * Il  s'agit  d'une  valeur  comprise  entre 0  et  1.  Elle  exprime
 * l'intention du  joueur qui peut  avoir utilisé le  clavier, l'écran
 * tactile, le gamepad, ...
 */
var ACTIONS = {
  Up: 0, Down: 0, 
  North: 0, South: 0, East: 0, West: 0,
  Normal: 0,
  Debug: 0
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

// Association de touches et d'actions.
var KEYS = {
  '9': 'NE',
  '3': 'SE',
  '1': 'SW',
  '7': 'NW'
};

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
