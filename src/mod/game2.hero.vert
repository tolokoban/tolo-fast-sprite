precision mediump float;

uniform float uniWidth;
uniform float uniHeight;
uniform float uniX;
uniform float uniY;
uniform float uniZ;
uniform float uniTime;
uniform int uniFlip;

attribute vec2 attXY;
attribute vec2 attUV;
varying vec2 varUV;

const float FACTOR = 0.3;

void main() {
  varUV = vec2( attUV.x, 1.0 - attUV.y );
  float alpha = abs(cos( uniTime * 0.003 ));
  float X = mix(attXY.x, attUV.x, alpha);
  float Y = mix(attXY.y, attUV.y, alpha);
  
  float x = X * 0.6;
  if( uniFlip == 1 ) {
    x = 0.5 - x;
  }
  float y = Y;
  
  x *= FACTOR * uniHeight / uniWidth;
  y *= FACTOR;
  
  gl_Position = vec4( x, y, 0.0, 1.0 );
}
