precision mediump float;

uniform float uniWidth;
uniform float uniHeight;
uniform float uniX;
uniform float uniY;
uniform float uniZ;

attribute vec2 attUV;
varying vec2 varUV;

const float FACTOR = 0.07;

void main() {
  varUV = attUV;
  
  vec3 pos = vec3(varUV.x, varUV.y, -0.75) - vec3( uniX, uniY, uniZ );
  float dist = 1.0 / (10.0 - (pos.z * 0.5));
  float tilt = 0.35;
  float x = pos.x;
  float y = pos.y + pos.z * tilt;
  
  x *= FACTOR * uniHeight / uniWidth;
  y *= FACTOR;
  
  gl_Position = vec4( x, y, pos.z * 0.01, dist );
}




