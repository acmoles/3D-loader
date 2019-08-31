import * as THREE from '../node_modules/three/build/three.module.js';
import anime from '../node_modules/animejs/lib/anime.es.js';

export class Grid {

  constructor(worldScene, loadedContent) {
    this.GRID = [6, 6];
    this.col = this.GRID[0];
    this.row  = this.GRID[1];
    this.GRID_SIZE = this.col * this.row ;
    this.numberOfElements = this.col * this.row ; // TODO fix this duplicate
    this.SIZE = 4.5;
    this.FINAL_GRID_POSITION = -this.SIZE/21;
    this.INITIAL_GRID_POSITION = -window.innerHeight/10;
    this.GRID_ANIMATION_SPEED = 3000;
    this.SPACING = 1.5;
    this.gridElements = [];
    this.gridContainer;
    this.gridContainerWidth = ((this.col-1) * this.SIZE) + ((this.col-1) * this.SPACING);

    this.worldScene = worldScene;
    this.loadedContent = loadedContent
  }

  init() {
    this.addGridText();
  }

  addGridText() {

    var textContainer = new THREE.Object3D();

    var textMaterial = new THREE.MeshBasicMaterial({
      color: 0x222222
    });

    var globalCounter = 0;

    var loader = new THREE.FontLoader();

    loader.load( '../node_modules/three/examples/fonts/helvetiker_regular.typeface.json', ( font ) => {

      for (var c=0; c < this.col; c++) {
          for (var r=0; r < this.row; r++) {

              var geometry = new THREE.TextGeometry( globalCounter.toString(), {
                font: font,
                size: 1,
                height: 0.1,
              } );

              var element = new THREE.Mesh(geometry, textMaterial);
              element.position.x = c * (this.SIZE + this.SPACING);
              element.position.z = r * (this.SIZE + this.SPACING);

              textContainer.add(element);

              globalCounter++;
          }
      }
      textContainer.rotation.y = 0.5 * Math.PI;

      textContainer.position.x = textContainer.position.x - (this.gridContainerWidth/2);
      textContainer.position.z = textContainer.position.z + (this.gridContainerWidth/2);
      this.worldScene.add(textContainer);

    } );
  }

}
