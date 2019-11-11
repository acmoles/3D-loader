export class NoiseLayer {

  constructor() {
    this.canvas = document.createElement( 'canvas' );
		this.canvas.id = 'noise';

    var w = this.canvas.width = 256;
    var h = this.canvas.height = 256;

    var context = this.canvas.getContext("2d");

    for( var i=0; i<w; i++ ) {
        for( var j=0; j<h; j++ ) {

            var num = Math.floor(Math.random()*255)
            context.fillStyle = "rgba(" + num + "," + num + "," + num + "," + .08 + ")";
            context.fillRect(i, j, 1, 1);
        }
    }

    this.noiseImage = this.canvas.toDataURL();

    var css = '.noise-background { background-image: url(' + this.noiseImage + '); }',
    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');

    head.appendChild(style);

    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));

  }

}
