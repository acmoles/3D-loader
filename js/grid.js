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
    this.gridContainer = new THREE.Object3D();
    this.gridContainerWidth = ((this.col-1) * this.SIZE) + ((this.col-1) * this.SPACING);

    this.worldScene = worldScene;
    this.loadedContent = loadedContent;
  }

  init() {
    // this.addGridText();
    this.makeGrid();
    this.radialScaleGrid();
    this.parentModelsToGrid();
    // this.positionGridElements();
    // this.animateGridIn();
  }

  makeGrid () {

    var gridMaterial = new THREE.MeshBasicMaterial({
      color: 0xC0CCDA
    });

    for (var c=0; c<this.col; c++) {
        for (var r=0; r<this.row; r++) {

            var x = c * (this.SIZE + this.SPACING);
            var z = r * (this.SIZE + this.SPACING);
            var y = this.FINAL_GRID_POSITION;
            var name = 'Grid c' + c + 'r' + r;

            var element = this.makeGridElement(x, y, z, this.SIZE, gridMaterial, name)

            this.gridElements.push(element);
            this.gridContainer.add(element.mesh);
            this.loadedContent.interactables.push(element.mesh);
        }
    }
    this.gridContainer.rotation.y = 0.5 * Math.PI;

    this.gridContainer.position.x = this.gridContainer.position.x - (this.gridContainerWidth/2);
    this.gridContainer.position.z = this.gridContainer.position.z + (this.gridContainerWidth/2);
    this.worldScene.add(this.gridContainer);

    // console.log('length of elements: ', gridElements);
    // console.log('intended length: ', numberOfElements);

  }

  makeGridElement(x, y, z, s, material, name) {
    let e = {};

    e.x = x
    e.y = y
    e.z = z

    e.scaleX = 1;
    e.scaleZ = 1;

    e.mesh = new THREE.Mesh(new THREE.BoxGeometry(s,s/12,s), material);
    e.mesh.position.x = x
    e.mesh.position.y = y
    e.mesh.position.z = z
    e.mesh.name = name;


    e.update = () => {
      e.mesh.position.y = e.y;
      e.mesh.scale.x = e.scaleX;
      e.mesh.scale.z = e.scaleZ;
    }

    return e;
  }

  parentModelsToGrid() {
    this.gridElements[19].mesh.attach(this.loadedContent.getModelByName('Whiteboard').mesh.parent);
    this.gridElements[13].mesh.attach(this.loadedContent.getModelByName('Ant').mesh.parent);
    this.gridElements[9].mesh.attach(this.loadedContent.getModelByName('ColF').mesh.parent);
    this.gridElements[16].mesh.attach(this.loadedContent.getModelByName('ColM').mesh.parent);
  }

  positionGridElements() {
    this.gridElements.forEach( (e) => {
      e.y = this.INITIAL_GRID_POSITION;
      e.update();
    })
  }

  animateGridIn() {
    // TODO delay until loaded
    const staggersAnimation = anime.timeline({
      targets: this.gridElements,
      easing: 'spring(1, 100, 13, 0)',
      autoplay: false
    })
    .add({
      duration: this.gridAnimtionSpeed,
      y: this.FINAL_GRID_POSITION,
      update: this.renderAnimation,
      delay: anime.stagger(100, {grid: this.GRID, from: 'first'})
    });

    setTimeout( () => {
      staggersAnimation.play();
    }, 500);
  }

  clickAnimation(element) {
    this.gridElements.forEach( (gridElement, index) => {
      if (element === gridElement.mesh) {
        // console.log('found match', index);
        // gridElement.mesh.y = this.FINAL_GRID_POSITION;
        let elementsToAnimate = this.gridElements.slice(0);
        elementsToAnimate.splice(index, 1);

        anime({
          targets: elementsToAnimate,
          easing: 'easeInOutQuad',
          keyframes: [
             {
               y: anime.stagger(-1, {grid: this.GRID, from: index}),
               duration: 100
             }, {
               y: anime.stagger(1, {grid: this.GRID, from: index}),
               duration: 225
             }, {
               y: anime.stagger(this.FINAL_GRID_POSITION, {grid: this.GRID, from: index}),
               duration: 600,
             }
           ],
          update: this.renderAnimation,
          delay: anime.stagger(80, {grid: this.GRID, from: index})
        })

      }
    } );
  }

  radialScaleGrid() {
    let radialGroups = [
      [14, 15, 20, 21],
      [8, 9, 13, 16, 19, 22, 26, 27],
      [2, 3, 7, 10, 12, 17, 18, 23, 25, 28, 32, 33],
      [1, 4, 6, 11, 24, 29, 31, 34],
      [0, 5, 30, 35]
    ]

    for (var i = 0; i < radialGroups.length; i++) {
      for (var j = 0; j < radialGroups[i].length; j++) {
        let e = this.gridElements[radialGroups[i][j]];
        let scale = 1 - (i*0.1);
        e.scaleX = scale;
        e.scaleZ = scale;
        e.update();
      }
    }

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

  renderAnimation(anim) {
    for (var i = 0; i < anim.animatables.length; i++) {
      anim.animatables[i].target.update();
    }
  }

}
