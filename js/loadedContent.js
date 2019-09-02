import * as THREE from '../node_modules/three/build/three.module.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { EventTarget } from '../node_modules/event-target-shim/dist/event-target-shim.mjs';
import anime from '../node_modules/animejs/lib/anime.es.js';

export class LoadedContent extends EventTarget {

  constructor(worldScene) {
    super();
    this.worldScene = worldScene;
    this.gltfScene = null;
    this.TRANSITION = 1;
    this.animations = [];
    this.interactables = [];

    this.LOADPATH = '../import-test-scene/characters-export4-test-uncompressed.glb';

    this.models = [
      { name: 'Ant',
        mesh: null,
        position: { x: -8.5, y: 0, z: 5 },
        rotation: { x: 0, y: 0.84 * Math.PI, z: 0 },
        startAction: 'idleStandard',
        actionSequence: ['headNodYes', 'pointing'],
        actionSequenceProgress: 0,
        actions: {},
        mixer: null
      },
      { name: 'ColF',
        mesh: null,
        position: { x: 3.5, y: 0, z: 10 },
        rotation: { x: 0, y: 1.16 * Math.PI, z: 0 },
        startAction: 'idleStandard',
        actionSequence: ['pointing', 'headNodYes'],
        actionSequenceProgress: 0,
        actions: {},
        mixer: null
      },
      { name: 'ColM',
        mesh: null,
        position: { x: 10, y: -0.33, z: 4 },
        rotation: { x: 0, y: 1.38 * Math.PI, z: 0 },
        startAction: 'idleStandard',
        actionSequence: ['headNodYes', 'pointing'],
        actionSequenceProgress: 0,
        actions: {},
        mixer: null
      },
      { name: 'Whiteboard',
        mesh: null,
        position: { x: 0, y: - 0.05, z: - 0.9 },
        rotation: null,
        actionSequence: [null],
        mixer: null
      },
    ];
  }

  init() {
    this.loadModels( () => {
      this.startAnimationSequence();
      this.dispatchEvent(new Event('loaded'));
    } );
  }

  loadModels(callback) {

    this.loadGLTF( () => {

      this.gltfScene.traverse( ( child ) => {

        if ( child.isMesh ) {

          if (child.name === 'Whiteboard') {
            this.equipMesh( this.getModelByName('Whiteboard'), child );
            child.scale.z = 0.95;
          }

          if (child.name === 'AntMesh') {
            this.equipMesh( this.getModelByName('Ant'), child );
          }

          if (child.name === 'ColFMesh') {
            this.equipMesh( this.getModelByName('ColF'), child );
          }

          if (child.name === 'ColMMesh') {
            this.equipMesh( this.getModelByName('ColM'), child );
          }

          if (child.name === 'Bulb') {
            child.visible = false;
            // TODO something with the bulb...
          }

        }

      });

      for ( var i = 0; i < this.models.length; i++ ) {
        this.positionModel( this.models[i] );
        this.rotateModel( this.models[i] );
      }

      callback();

    } );

  }

  equipMesh( meshobject, child ) {
    meshobject.mesh = child;
    this.interactables.push(meshobject.mesh);

    if (meshobject.actionSequence[0] !== null) {
      meshobject.mesh.animations = this.animations; // Set to stored extracted animations
      let mixer = this.startAnimation( meshobject.mesh, meshobject.actions, meshobject.startAction );
      meshobject.mixer = mixer;
    }
  }

  startAnimation( skinnedMesh, modelActions, startActionName ) {
    let mixer = new THREE.AnimationMixer( skinnedMesh );
    skinnedMesh.animations.forEach((animationClip) => {
      let action = mixer.clipAction( animationClip );
      modelActions[ animationClip.name ] = action;
      this.setWeight( modelActions[ animationClip.name ] , 0 );
    });

    // Set inital animation weight to 1 (it's nice we can key into the actions object by name)
    this.setWeight( modelActions[ startActionName ], 1 );

    // Start playing all actions
    for (var key in modelActions) {
      // skip loop if the property is from prototype
      if (!modelActions.hasOwnProperty(key)) continue;

      modelActions[key].play();
    }

    modelActions[ startActionName ].time = anime.random(0, 5);

    return mixer;
  }

  doLookdown() {
    // TODO crossfade to lookdown on click, stop action sequence, animate tile downwards
  }

  startAnimationSequence() {

    this.models.forEach((model, i) => {
      if (model.mixer !== null) {

        // setTimout till first action in sequence
        setTimeout( () => {
          let firstAction = model.actions[ model.actionSequence[model.actionSequenceProgress] ];
          this.executeCrossFade( model.actions['idleStandard'], firstAction, this.TRANSITION );
        }, (this.models.length - i) * 2000 * Math.random() );

        model.mixer.addEventListener( 'loop', ( e ) => {

          let clipName = e.action.getClip().name;
          let currentActionInSequence = model.actionSequence[model.actionSequenceProgress];
          // IF the action that just looped is the current in the sequence and is weighted on
          if (clipName === currentActionInSequence && e.action.weight === 1) {
            // THEN a step in the sequence just finished

            // Increment sequence position
            model.actionSequenceProgress++

            // Check if we're at the end and reset if so
            if (model.actionSequenceProgress > model.actionSequence.length - 1) {
              // console.log('repeat sequence: ', model.name);
              model.actionSequenceProgress = 0;
            }

            let nextAction = model.actions[ model.actionSequence[model.actionSequenceProgress] ];

            // console.log('model: ', model.name);
            // console.log('position in sequence: ', model.actionSequenceProgress);
            // console.log('end action: ', currentActionInSequence);
            // console.log('start action: ', nextAction.getClip().name);

            // Crossfade out current step to idle if not idle
            this.executeCrossFade( model.actions[currentActionInSequence], model.actions['idleStandard'], this.TRANSITION );

            // Start the next step in the sequence after a timeout
            setTimeout( () => {
              this.executeCrossFade( model.actions['idleStandard'], nextAction, this.TRANSITION );
            }, (this.models.length - i) * 1000 * Math.random() );

          }


        } );

      }
    });
  }

  loadGLTF(callback) {
    // Instantiate a loader
    var loader = new GLTFLoader();

    // Load a glTF resource
    loader.load(
      // resource URL
      this.LOADPATH,
      // called when the resource is loaded
      ( gltf ) => {
        // Store animations in global object
        this.animations = gltf.animations;
        // console.log(animations);

        // Store loaded scene in global object
        this.gltfScene = gltf.scene;

        this.worldScene.add( this.gltfScene );

        callback();
      },
      // called while loading is progressing
      ( xhr ) => {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      ( error ) => {
        console.log( 'An error happened', error );
      }
    );
  }

  getModelByName( name ) {
    for ( var i = 0; i < this.models.length; ++ i ) {
      if ( this.models[ i ].name === name ) {
        return this.models[ i ];
      }
    }
    return null;
  }

  setWeight( action, weight ) {
    action.enabled = true;
    action.setEffectiveTimeScale( 1 );
    action.setEffectiveWeight( weight );
  }

  executeCrossFade( startAction, endAction, duration ) {
      this.setWeight( endAction, 1 );
      endAction.time = 0;
      startAction.crossFadeTo( endAction, duration, true );
  }

  positionModel( model ) {
    let parent = model.mesh.parent;
    parent.position.x = model.position.x;
    parent.position.y = model.position.y;
    parent.position.z = model.position.z;
  }

  rotateModel( model ) {
    if (model.rotation !== null) {
      let parent = model.mesh.parent;
      parent.rotation.y = model.rotation.y;
    }
  }

}
