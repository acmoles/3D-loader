import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';
import { EventTarget } from '../node_modules/event-target-shim/dist/event-target-shim.mjs';

import { Renderer } from './renderer.js'
import { LoadedContent } from './LoadedContent.js'
import { Grid } from './grid.js'
import { Interactions } from './interactions.js'

export class ThreeComposition extends EventTarget {

  constructor(domParent) {
    super();
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.worldScene = new THREE.Scene();
    this.camFactor = 32;
    this.camera = new THREE.OrthographicCamera();
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    this.container = domParent;
    this.clock = new THREE.Clock();
    this.stats = new Stats();

    this.content = new LoadedContent(this.worldScene);

    this.grid = new Grid(
      this.worldScene,
      this.content
    );

    this.interactions = new Interactions(
      this.camera,
      this.container,
      this.content.interactables
    );

    this.configRenderer();
    this.configScene();
  }

  init() {
    this.content.addEventListener('loaded', () => {
      this.grid.init();
      this.interactions.init();
      this.dispatchEvent(new Event('comp-loaded'));
    });
    this.content.init();
    this.animate();
  }

  animate() {
    requestAnimationFrame( () => { this.animate(); } );


    var mixerUpdateDelta = this.clock.getDelta();

    for ( var i = 0; i < this.content.models.length; ++ i ) {
      if (this.content.models[ i ].mixer !== null) {
        this.content.models[ i ].mixer.update( mixerUpdateDelta );
      }
    }

    this.interactions.checkForIntersect();


    this.renderer.render( this.worldScene, this.camera );
    this.stats.update();
  }

  configRenderer() {
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.gammaOutput = true;
    this.container.appendChild( this.renderer.domElement );

    this.container.appendChild( this.stats.dom );
  }

  configScene() {
    this.camera.position.set( 33, 30, 33 );
    this.controls.target.set( 0, 5.5, 0 );
    this.worldScene.background = new THREE.Color( 0xFFFFFF );
    this.onWindowResize();
    // var axesHelper = new THREE.AxesHelper( 5 );
    // worldScene.add( axesHelper );

    // TODO add these to restrict user camera
    let maxAngle = (7 / 20) * Math.PI;
    this.controls.maxPolarAngle = maxAngle;
    this.controls.minPolarAngle = maxAngle;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;

    this.controls.update();

    window.addEventListener( 'resize', () => { this.onWindowResize(); }, false );
  }

  onWindowResize() {
    let width = window.innerWidth;
    let height = window.innerHeight;

    this.renderer.setSize( width, height );

    this.camera.left = width / - this.camFactor;
    this.camera.right = width / this.camFactor;
    this.camera.top = height / this.camFactor;
    this.camera.bottom = height / - this.camFactor;

    this.camera.updateProjectionMatrix();
  }
}
