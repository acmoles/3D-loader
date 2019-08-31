import * as THREE from '../node_modules/three/build/three.module.js';
import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';

export class Renderer {

  constructor(domParent, worldScene, camera) {
    this.container = domParent;
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.clock = new THREE.Clock();
    this.stats = new Stats();
  }

  init() {
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.gammaOutput = true;
    this.container.appendChild( this.renderer.domElement );

    this.container.appendChild( this.stats.dom );
  }

}
