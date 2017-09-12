precision lowp float;

varying vec2 varUV;

// Textures.
uniform sampler2D tex;

void main() { 
  gl_FragColor = texture2D(tex, varUV);
  if( gl_FragColor.a <= 1.0 / 255.0 ) discard;
}
