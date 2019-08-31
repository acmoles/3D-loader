import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';

import { LoadedContent } from './LoadedContent.js'
import { Grid } from './grid.js'
import { Interactions } from './interactions.js'

export class ThreeComposition {

  constructor(domParent) {
    this.camFactor = 32;
    this.container = null; // Dom container
    this.stats = null;
    this.worldScene = null; // THREE.Scene where it all will be rendered
    this.renderer = null;
    this.camera = null;
    this.clock = null;
    this.controls = null;
    this.finishedLoading = false;

    this.content = new LoadedContent(this.worldScene);
    this.grid = new Grid(this.worldScene, this.content);
    this.Interactions = new Interactions();
  }
}
