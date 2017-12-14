This is still a work in progress...

# tolo-fast-sprite

See it in action: [Q*bert revival](https://tolokoban.github.io/tolo-fast-sprite/game1.html).

----

WebGL is fast executing orders, but sending it an order is time consumming.
That's why you'd better give it a lot of work at once.

That's the purpose of this library: painting a lot of sprites at once.

Here is a basic example:

``` js
var painter = new ToloFastSprite({
  gl: webglContext,
  atlas: imageWithAllTheSprites,
  cellSrcW: 0.5, cellSrcH: 0.5,
  cellDstW: 128, cellDstH: 128
});

painter.addCellXY( 128, 200, 0, 0 );
painter.addCellXY( 196, 100, 1, 0 );

painter.paint( time );
```

## API
### `new ToloFastSprite( options )`

* __gl__ (mandatory): the [WebGLRenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext) on which to paint.
* __atlas__ (mandatory): an image, or canvas, or video in which you have all the sprites you want to use.

#### Cells

Use _cells_ when your atlas if made of sprites with the same dimensions, layed out in a grid. Usefull for platform games with tiles.

* __cellSrcW__ (default = 1): width of the tile in the atlas, expressed as a real number between 0 and 1. 1 beeing the full width of the atlas.
* __cellSrcH__ (default = 1): height of the tile in the atlas, expressed as a real number between 0 and 1. 1 beeing the full height of the atlas.
* __cellDstW__ (default = 64) : width of the cell in the sprite space.
* __cellDstH__ (default = 64) : height of the cell in the sprite space.

For example, if you set this:
``` js
{ cellSrcW: 0.25, cellSrcH: 0.33, cellDstW: 100, cellDstH: 120 }
```

Then, both following instructions give the same result:
``` js
painter.addCellXY( 50, 60, 2, 1 );
painter.add(
  50,       60,       0, 2 * 0.25,     1 * 0.33,
  50 + 100, 60,       0, (2+1) * 0.25, 1 * 0.33,
  50 + 100, 60 + 120, 0, (2+1) * 0.25, (1+1) * 0.33,
  50,       60 + 120, 0, 2 * 0.25,     (1+1) * 0.33,
);
```


### `x`, `y`, `z`

Set the coordinates of the center of the view. Usefull for fast scrollings.

### `clear()`

Remove all the sprites.

### `add( x1, y1, z1, u1, v1, ..., x4, y4, z4, u4, v4 ) : ref`

This is the most generic function of this library.

### `updateXYZ( ref, x1, y1, z1, ..., x4, y4, z4 )`

### `updateUV( ref, u1, v1, ..., u4, v4 )`

### `updateAtlas( img )`

__Warning!__ This is a time consuming function.

### `remove( ref )`

Remove the sprite with the given reference.

### `paint( time )`

Paint all the sprites at once.
