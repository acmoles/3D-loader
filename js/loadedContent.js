import * as THREE from '../node_modules/three/build/three.module.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { EventTarget } from '../node_modules/event-target-shim/dist/event-target-shim.mjs';

export class LoadedContent extends EventTarget {

  constructor(worldScene) {
    super();
    this.gltfScene = null;
    this.TRANSITION = 1;
    this.animations = []; // Global animations object - pulles from loaded GLTF
    this.interactables = [];

    this.LOADPATH = './import-test-scene/characters-export4-test-uncompressed.glb';

    this.models = [
      { name: 'Ant',
        mesh: null,
        position: { x: -8.5, y: 0, z: 5 },
        rotation: { x: 0, y: 0.84 * Math.PI, z: 0 },
        startAction: 'idleStandard',
        actionSequence: ['pointing', 'headNodYes', 'headNodYes'],
        actionSequenceProgress: 0,
        actions: {},
        mixer: null
      },
      { name: 'ColF',
        mesh: null,
        position: { x: 3.5, y: 0, z: 10 },
        rotation: { x: 0, y: 1.16 * Math.PI, z: 0 },
        startAction: 'idleStandard',
        actionSequence: ['pointing', 'headNodYes', 'headNodYes'],
        actionSequenceProgress: 0,
        actions: {},
        mixer: null
      },
      { name: 'ColM',
        mesh: null,
        position: { x: 10, y: -0.33, z: 4 },
        rotation: { x: 0, y: 1.38 * Math.PI, z: 0 },
        startAction: 'idleStandard',
        actionSequence: ['pointing', 'headNodYes', 'headNodYes'],
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
    this.dispatchEvent(new Event('loaded'));
  }

  getModelByName( name ) {
    for ( var i = 0; i < this.models.length; ++ i ) {
      if ( this.models[ i ].name === name ) {
        return this.models[ i ];
      }
    }
    return null;
  }

}
