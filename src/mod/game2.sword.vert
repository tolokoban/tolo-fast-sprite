precision mediump float;

uniform float uniWidth;
uniform float uniHeight;
uniform float uniX;
uniform float uniY;
uniform float uniZ;
uniform float uniCX;
uniform float uniCY;
uniform float uniCZ;
uniform float uniTime;

attribute vec2 attUV;
attribute float attAngle;
varying vec2 varUV;

const float FACTOR = 0.07;
const float RADIUS = 0.3;

void main() {
  varUV = attUV;

  float ang = attAngle + uniTime * 0.001;
  float x = RADIUS * cos(ang) + uniCX;
  float y = uniCY;
  float z = RADIUS * sin(ang) + uniCZ;
  
  vec3 pos = vec3(x, y, z) - vec3( uniX, uniY, uniZ );
  float dist = 1.0 / (10.0 - (pos.z * 0.5));
  float tilt = 0.35;
  x = pos.x;
  y = pos.y + pos.z * tilt;

  x *= FACTOR * uniHeight / uniWidth;
  y *= FACTOR;

  gl_Position = vec4( x, y, pos.z * 0.01, dist );
}
