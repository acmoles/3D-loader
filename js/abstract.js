import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';
import { EventTarget } from '../node_modules/event-target-shim/dist/event-target-shim.mjs';
import anime from '../node_modules/animejs/lib/anime.es.js';

// import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
// import { ShaderPass } from '../node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
// import { ClearPass } from '../node_modules/three/examples/jsm/postprocessing/ClearPass.js';
// import { MaskPass, ClearMaskPass } from '../node_modules/three/examples/jsm/postprocessing/MaskPass.js';
// import { CopyShader } from '../node_modules/three/examples/jsm/shaders/CopyShader.js';
// import { FXAAShader } from '../node_modules/three/examples/jsm/shaders/FXAAShader.js';
// import { NoiseShader } from './noiseShader.js'
import { SphereShader } from './sphereShader.js'

import * as dat from '../node_modules/dat.gui/build/dat.gui.module.js';

console.log('watch out! 3D content loaded.');

export class Abstract extends EventTarget {

  constructor(domParent) {
    super();
    this.colors = {
      ground: 0x13CE66,
      base: 0x13CE66,
      ambient: 0x13CE66,
      light: 0xFF0000
    }
    // GroundColor		= 0x13CE66,
    // GumColor		= 0x08007F,
    // AmbientColor	= 0xB5B5B5,
    // LightColor		= 0xFF0000;

    this.vw = window.innerWidth;
		this.vh = window.innerHeight;

    this.container = domParent;
    this.clock = new THREE.Clock();
    this.start = Date.now();
    this.stats = new Stats();
    this.gui = new dat.GUI();

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

    this.gui.add(this, 'near', 0, 100);
    this.gui.add(this, 'far', 100, 1000);
    this.gui.add(this, 'zoom', 0, 100);

    window.getCamera = this.getCamera.bind(this);

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
    console.log(this.camera.zoom);

    this.renderer.setClearColor( this.colors.ground, 0 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( this.vw, this.vh );
    // this.renderer.physicallyCorrectLights = true;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild( this.renderer.domElement );
    this.container.appendChild( this.stats.dom );
    //
    // this.composer = new EffectComposer(this.renderer);
    // this.composer.addPass( new RenderPass(this.scene, this.camera));

    // var	glitchPass = new THREE.GlitchPass();
    // glitchPass.renderToScreen = true;

    // this.fxaaPass = new ShaderPass( FXAAShader );
    // this.fxaaPass.writeToScreen = true;
    // this.composer.addPass( this.fxaaPass );
  }

  configScene() {
    // this.camera.position.set( 0, 0, 100 );
    // this.camera.position.set( 10, 56, -26 );
    this.camera.position.set( 5, -25, 75 );

    this.camera.lookAt(this.scene.position);

    // TEMP
    var axesHelper = new THREE.AxesHelper( 5 );
    this.scene.add( axesHelper );

    this.ambient = new THREE.AmbientLight(this.colors.ambient);
    this.light = new THREE.DirectionalLight(this.colors.light, 30);
    this.light.position.set( 10, 10, 2 );

    this.scene.add(this.camera);
    this.scene.add(this.ambient);
    this.scene.add(this.light);

    this.onWindowResize();
    window.addEventListener( 'resize', () => { this.onWindowResize(); }, false );
  }

  getCamera() {
    console.log(this.camera.position);
  }

  configSphere() {
    this.geometry = new THREE.IcosahedronGeometry(12, 2);
    // this.geometry = new THREE.PlaneGeometry( 24, 24, 64, 64 );
    // this.geometry = new THREE.SphereGeometry( 16,16,16);

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

    // this.material = new THREE.MeshLambertMaterial({ color: this.colors.base, wireframe: false });
    this.sphere = new THREE.Mesh(this.geometry, this.material);
    this.sphere.position.set( 8, 8, 0 );
    this.sphere.rotation.x = Math.PI / 3
    this.sphere.rotation.y = Math.PI / 8
    this.sphere.rotation.z = Math.PI / 6
    this.sphere.scale.x = 1.5;
    // this.sphere.modifier = Math.random();
		this.sphere.material.transparent = true;
    // this.sphere.material.opacity = 0.5;
		// this.sphere.material.opacity = 1*Math.random();

    this.scene.add(this.sphere);
  }

  animate() {
    requestAnimationFrame( () => { this.animate(); } );

    // this.composer.render();
    this.renderer.render( this.scene, this.camera );
    this.stats.update();

    //
		this.uniforms.time.value = .00005 * ( Date.now() - this.start );
    this.uniforms.near.value = this.near;
    this.uniforms.far.value = this.far;

    // this.camera.near = this.near;
    this.camera.far = this.far;
    this.camera.zoom = this.zoom;
    this.camera.updateProjectionMatrix();
    //
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
