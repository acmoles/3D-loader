import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

import { Renderer } from './renderer.js'
import { LoadedContent } from './LoadedContent.js'
import { Grid } from './grid.js'
import { Interactions } from './interactions.js'

export class ThreeComposition {

  constructor(domParent) {
    this.worldScene = new THREE.Scene();
    this.camFactor = 32;
    let width = window.innerWidth;
    let height = window.innerHeight;
    this.camera = new THREE.OrthographicCamera( width / - this.camFactor, width / this.camFactor, height / this.camFactor, height / - this.camFactor, 1, 1000 );
    this.controls;

    this.finishedLoading = false;

    this.renderer = new Renderer(domParent, this.worldScene, this.camera);

    this.content = new LoadedContent(this.worldScene);

    this.grid = new Grid(
      this.worldScene,
      this.content
    );

    this.interactions = new Interactions(
      this.camera,
      domParent,
      this.content.interactables
    );

    this.makeScene();
  }

  init() {
    this.renderer.init();
    this.interactions.init();
    this.content.addEventListener('loaded', () => {
      console.log('loaded');
      this.grid.init();
    });
    this.content.init();
    this.animate();
  }

  animate() {
    requestAnimationFrame( () => { this.animate(); } );


    var mixerUpdateDelta = this.renderer.clock.getDelta();

    for ( var i = 0; i < this.content.models.length; ++ i ) {
      if (this.content.models[ i ].mixer !== null) {
        this.content.models[ i ].mixer.update( mixerUpdateDelta );
      }
    }

    // this.interactions.checkForIntersect();


    this.renderer.renderer.render( this.worldScene, this.camera );
    this.renderer.stats.update();
  }

  makeScene() {
    this.camera.position.set( 33, 30, 33 );
    this.worldScene.background = new THREE.Color( 0xFFFFFF )
    // var axesHelper = new THREE.AxesHelper( 5 );
    // worldScene.add( axesHelper );

    this.controls = new OrbitControls( this.camera, this.renderer.renderer.domElement );
    this.controls.target.set( 0, 5.5, 0 );

    // TODO add these to restrict user camera
    let maxAngle = (7 / 20) * Math.PI;
    this.controls.maxPolarAngle = maxAngle;
    this.controls.minPolarAngle = maxAngle;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;

    this.controls.update();

    window.addEventListener( 'resize', this.onWindowResize, false );
  }

  onWindowResize() {
    let width = window.innerWidth;
    let height = window.innerHeight;

    this.renderer.renderer.setSize( width, height );

    this.camera.left = width / - this.camFactor;
    this.camera.right = width / this.camFactor;
    this.camera.top = height / this.camFactor;
    this.camera.bottom = height / - this.camFactor;

   this.camera.updateProjectionMatrix();
  }
}
