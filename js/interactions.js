import * as THREE from '../node_modules/three/build/three.module.js';

export class Interactions {

  constructor(camera, container, interactables) {
    this.camera = camera;
    this.container = container;
    this.interactables = interactables;

    this.mouse = new THREE.Vector2();
    this.intersected;
    this.clickRadius = 500;
    this.theta = 0;
    this.frustumSize = 1000;
    this.raycaster = new THREE.Raycaster();
  }

  init() {
      this.container.addEventListener( 'mousemove', (e) => { this.updateMouse(e) }, false );
      this.container.addEventListener( 'mousedown', (e) => { this.onClick(e) }, false );
      this.container.addEventListener( 'touchstart', (e) => { this.onClick(e) }, false );

      // TODO mouse through pages using keyboard is nice
      // Snap to full screen position using scroll snap
      // document.addEventListener( 'keydown', onDocumentKeyDown, false );
      // document.addEventListener( 'keyup', onDocumentKeyUp, false );

      // TODO not intersects until first mouse move
  }

  updateMouse( event ) {
    event.preventDefault();
    this.mouse.x = ( event.clientX / this.container.offsetWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / this.container.offsetHeight ) * 2 + 1;
  }

  onClick( event ) {
    event.preventDefault();

    this.checkForIntersect((element) => {
      // Click hover animation
      console.log('clicked: ', element);
    });
  }

  checkForIntersect( callback ) {
      // TODO fix camera type error
      this.raycaster.setFromCamera( this.mouse, this.camera );
      var intersects = this.raycaster.intersectObjects( this.interactables );

      if ( intersects.length > 0 ) {

        if ( callback ) {
          // click animation
          callback(intersects[ 0 ].object);
          return
        }
        if ( this.intersected != intersects[ 0 ].object ) {
          this.intersected = intersects[ 0 ].object;
          console.log('Intersected: ', this.intersected);
          // TODO iterate up parents until geometry is BoxGeometry in a method (below)

          // Do some hover animation
        }

      } else {
        // undo hover animation
        this.intersected = null;
      }

  }

  findParentGridElement() {

  }
}
