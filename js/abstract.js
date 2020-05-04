import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
// import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';
import { EventTarget } from '../node_modules/event-target-shim/dist/event-target-shim.mjs';
import anime from '../node_modules/animejs/lib/anime.es.js';

import { SphereShader } from './sphereShader.js'

// import * as dat from '../node_modules/dat.gui/build/dat.gui.module.js';

export class Abstract extends EventTarget {

  constructor(domParent) {
    super();

    this.vw = window.innerWidth;
		this.vh = window.innerHeight;

    this.container = domParent;
    this.clock = new THREE.Clock();
    this.start = Date.now();
    // this.stats = new Stats();
    // this.gui = new dat.GUI();

    // Variables
    this.near = 1;
    this.far = 196;
    this.zoom = 1;

    this.configRenderer();
    this.configScene();
    this.configSphere();
  }

  init() {
    console.log('init abstract');

    // this.gui.add(this, 'near', 0, 100);
    // this.gui.add(this, 'far', 100, 1000);
    // this.gui.add(this, 'zoom', 0, 100);

    // window.getCamera = this.getCamera.bind(this);

    this.animate();
    this.dispatchEvent(new Event('abstract-loaded'));

    anime({
      targets: this.camera.position,
      x: 3.84,
      y: -19.35,
      z: 57.66,
      duration: 4000,
      easing: 'easeInOutCubic',
    })
  }

  configRenderer() {
    this.renderer = new THREE.WebGLRenderer( { alpha: true, depth: true } );
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.vw / this.vh, 1, this.far);

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    this.renderer.setClearColor( 0x13CE66, 0 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( this.vw, this.vh );

    this.container.appendChild( this.renderer.domElement );
    // this.container.appendChild( this.stats.dom );
  }

  configScene() {
    this.camera.position.set( 5, -25, 75 );

    this.camera.lookAt(this.scene.position);

    // TEMP
    // var axesHelper = new THREE.AxesHelper( 5 );
    // this.scene.add( axesHelper );

    this.scene.add(this.camera);

    this.onWindowResize();
    window.addEventListener( 'resize', () => { this.onWindowResize(); }, false );
  }

  getCamera() {
    console.log(this.camera.position);
  }

  configSphere() {
    this.geometry = new THREE.IcosahedronGeometry(12, 2);

    this.uniforms = {
      time: { type:"f", value: this.start },
      near: { value: this.near },
      far: { value: this.far },
    };

    this.material = new THREE.ShaderMaterial( {
			uniforms: this.uniforms,
			vertexShader : SphereShader.vertexShader,
			fragmentShader : SphereShader.fragmentShader,
      transparent: true,
      fog: true
		} );

    this.sphere = new THREE.Mesh(this.geometry, this.material);
    this.sphere.position.set( 10, 10, 0 );
    this.sphere.rotation.x = Math.PI / 3
    this.sphere.rotation.y = Math.PI / 8
    this.sphere.rotation.z = Math.PI / 6
    this.sphere.scale.x = 1.5;
		this.sphere.material.transparent = true;

    this.scene.add(this.sphere);
  }

  animate() {
    requestAnimationFrame( () => { this.animate(); } );

    this.renderer.render( this.scene, this.camera );
    // this.stats.update();

		this.uniforms.time.value = .00005 * ( Date.now() - this.start );
    // this.uniforms.near.value = this.near;
    // this.uniforms.far.value = this.far;

    // TODO remove
    // this.camera.far = this.far;
    // this.camera.zoom = this.zoom;
    // this.camera.updateProjectionMatrix();
  }

  onWindowResize() {
    this.renderer.setSize( this.vw, this.vh );
    // this.composer.setSize( this.vw, this.vh );

    // var pixelRatio = this.renderer.getPixelRatio();
    // this.fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( this.vw * pixelRatio );
    // this.fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( this.vh * pixelRatio );

    this.camera.left = this.vw / - this.camFactor;
    this.camera.right = this.vw / this.camFactor;
    this.camera.top = this.vh / this.camFactor;
    this.camera.bottom = this.vh / - this.camFactor;

    this.camera.updateProjectionMatrix();
  }

}
