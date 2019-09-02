import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';
import { EventTarget } from '../node_modules/event-target-shim/dist/event-target-shim.mjs';

import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '../node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from '../node_modules/three/examples/jsm/shaders/FXAAShader.js';

import { Renderer } from './renderer.js'
import { NoiseShader } from './noiseShader.js'
import { LoadedContent } from './LoadedContent.js'
import { Grid } from './grid.js'
import { Interactions } from './interactions.js'

export class ThreeComposition extends EventTarget {

  constructor(domParent, subParent) {
    super();
    this.renderer = new THREE.WebGLRenderer();
    this.subRenderer = new THREE.WebGLRenderer();

    this.worldScene = new THREE.Scene();
    this.subScene = new THREE.Scene();

    this.camFactor = 38;

    this.camera = new THREE.OrthographicCamera();
    this.subCamera = new THREE.OrthographicCamera();

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    this.container = domParent;
    this.subContainer = subParent;
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
      this.content.interactables,
      this.grid.gridElements
    );

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass( new RenderPass( this.worldScene, this.camera ) );
    this.customPass = new ShaderPass( NoiseShader );
    this.fxaaPass = new ShaderPass( FXAAShader );
    this.composer.addPass(this.customPass);
    this.composer.addPass(this.fxaaPass);

    this.composer2 = new EffectComposer(this.subRenderer);
    this.composer2.addPass( new RenderPass( this.subScene, this.subCamera ) );
    this.composer2.addPass(this.customPass);

    this.sharedCanvases = []

    this.configRenderer();
    this.configScene();
    this.generateSharedCanvases();
  }

  init() {
    this.content.addEventListener('loaded', () => {
      this.grid.init();
      this.interactions.init();
      this.dispatchEvent(new Event('comp-loaded'));
    });
    this.content.init();
    this.animate();

    this.interactions.addEventListener('click', (e) => {
      this.grid.clickAnimation(e.detail);
    } );
  }

  animate() {
    requestAnimationFrame( () => { this.animate(); } );


    var mixerUpdateDelta = this.clock.getDelta();

    for ( var i = 0; i < this.content.models.length; ++ i ) {
      if (this.content.models[ i ].mixer !== null) {
        this.content.models[ i ].mixer.update( mixerUpdateDelta );
      }
    }

    // this.renderer.render( this.worldScene, this.camera );
    this.customPass.uniforms['seed'].value += mixerUpdateDelta;
    this.customPass.uniforms['amount'].value = 0.13;
    this.composer.render();
    this.customPass.uniforms['amount'].value = 0.5;
    this.composer2.render();

    this.drawToSharedCanvases();

    this.stats.update();
  }

  drawToSharedCanvases() {
    this.sharedCanvases.forEach( (canvasObject) => {
      // canvasObject.context.clearRect(0, 0, 256, 256);

      canvasObject.context.drawImage(this.subRenderer.domElement, 0, 0);
    } );
  }

  generateSharedCanvases() {
    for (var i = 0; i < 10; i++) {
      let canvasObject = {};
      canvasObject.canvas = document.createElement('canvas');
      canvasObject.canvas.style.width = canvasObject.canvas.style.height = '256px';
      canvasObject.canvas.setAttribute('width', 256);
      canvasObject.canvas.setAttribute('height', 256);
      canvasObject.context = canvasObject.canvas.getContext('2d');
      this.sharedCanvases.push(canvasObject);
    }
  }

  configRenderer() {
    this.renderer.setClearColor(new THREE.Color(0xFFFFFF, 1.0));
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.gammaOutput = true;
    this.container.appendChild( this.renderer.domElement );

    this.subRenderer.setClearColor(new THREE.Color(0xFFFFFF, 1.0));
    this.subRenderer.setPixelRatio( window.devicePixelRatio );
    this.subRenderer.setSize( 256, 256 );
    this.subRenderer.gammaOutput = true;
    this.subContainer.appendChild( this.subRenderer.domElement );

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

    this.subScene.background = new THREE.Color( 0x1F2D3D );

    window.addEventListener( 'resize', () => { this.onWindowResize(); }, false );
  }

  onWindowResize() {
    let width = this.container.offsetWidth;
    let height = this.container.offsetHeight;

    this.renderer.setSize( width, height );
    this.composer.setSize( width, height );

    var pixelRatio = this.renderer.getPixelRatio();
		this.fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( this.container.offsetWidth * pixelRatio );
		this.fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( this.container.offsetHeight * pixelRatio );

    this.camera.left = width / - this.camFactor;
    this.camera.right = width / this.camFactor;
    this.camera.top = height / this.camFactor;
    this.camera.bottom = height / - this.camFactor;

    this.camera.updateProjectionMatrix();
  }
}
