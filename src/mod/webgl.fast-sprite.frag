precision lowp float;

varying vec3 varUV;

// Textures.
uniform sampler2D tex;

void main() { 
  gl_FragColor = texture2D(tex, varUV);
  if( gl_FragColor.a < 0.01 ) discard;
}
