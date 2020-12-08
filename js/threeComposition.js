import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';
import { EventTarget } from '../node_modules/event-target-shim/dist/event-target-shim.mjs';

import { LoadedContent } from './LoadedContent.js'
import { Grid } from './grid.js'
import { Interactions } from './interactions.js'

export class ThreeComposition extends EventTarget {

  constructor(domParent) {
    super();
    this.renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
    // Custom framerate for noise
    this.now; this.delta; this.fixedDelta; this.then = Date.now();
    this.interval = 1000/10;

    this.worldScene = new THREE.Scene();

    this.camFactor = 38;

    this.camera = new THREE.OrthographicCamera();

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    this.container = domParent;
    this.clock = new THREE.Clock();
    this.stats = new Stats();

    this.configRenderer();
    this.configScene();

    this.content = new LoadedContent(
      this.worldScene,
    );

    this.grid = new Grid(
      this.worldScene,
      this.content,
    );

    this.interactions = new Interactions(
      this.camera,
      this.container,
      this.content.interactables,
      this.grid.gridElements
    );

  }

  init() {
    this.content.addEventListener('loaded', () => {
      this.postLoad();
    });
    this.content.init();
    this.animate();
  }

  postLoad() {
    this.grid.init();
    this.interactions.init();

    this.dispatchEvent(new Event('comp-loaded'));

    this.interactions.addEventListener('click', (e) => {
      this.grid.click(e.detail);
    } );

    this.interactions.addEventListener('scroll', (e) => {
      this.grid.scroll(e.detail);
      this.content.scroll(e.detail);
    } );

    this.interactions.addEventListener('pause-external', (e) => {
      this.grid.pause();
    } );
  }

  animate() {
    requestAnimationFrame( () => { this.animate(); } );
    this.delta = this.clock.getDelta();

    for ( var i = 0; i < this.content.models.length; ++ i ) {
      if (this.content.models[ i ].mixer !== null) {
        this.content.models[ i ].mixer.update( this.delta );
      }
    }

    this.renderer.render( this.worldScene, this.camera );

    this.stats.update();
  }

  configRenderer() {
    let width = this.container.offsetWidth;
    let height = this.container.offsetHeight;

    this.renderer.setClearColor( 0x273444, 0 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( width, height );
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.gammaFactor = 2;

    this.container.appendChild( this.renderer.domElement );
    this.container.appendChild( this.stats.dom );
  }

  configScene() {
    this.camera.position.set( 33, 30, 33 );
    this.controls.target.set( 0, 5.5, 0 );

    //dark
    this.worldScene.background = null;

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
    let width = this.container.offsetWidth;
    let height = this.container.offsetHeight;

    this.renderer.setSize( width, height );

    this.camera.left = width / - this.camFactor;
    this.camera.right = width / this.camFactor;
    this.camera.top = height / this.camFactor;
    this.camera.bottom = height / - this.camFactor;

    this.camera.updateProjectionMatrix();
  }

}
