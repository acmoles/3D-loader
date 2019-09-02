import * as THREE from '../node_modules/three/build/three.module.js';
import { EventTarget } from '../node_modules/event-target-shim/dist/event-target-shim.mjs';
import anime from '../node_modules/animejs/lib/anime.es.js';
import updateOnScroll from '../node_modules/uos/dist/uos.mjs';

export class Interactions extends EventTarget {

  constructor(camera, container, interactables, gridElements) {
    super();
    this.camera = camera;
    this.container = container;
    this.interactables = interactables;
    this.gridElements = gridElements;

    this.mouse = new THREE.Vector2();
    this.intersected = null;
    this.clickRadius = 500;
    this.theta = 0;
    this.frustumSize = 1000;
    this.raycaster = new THREE.Raycaster();
  }

  init() {
      this.container.addEventListener( 'mousemove', (e) => { this.updateMouse(e) }, false );
      this.container.addEventListener( 'mousedown', (e) => { this.onClick(e) }, false );
      this.container.addEventListener( 'touchstart', (e) => { this.onClick(e) }, false );

      this.NOMINAL_GRID_Y = this.gridElements[0].y;

      // TODO mouse through pages using keyboard is nice
      // Snap to full screen position using scroll snap
      // document.addEventListener( 'keydown', onDocumentKeyDown, false );
      // document.addEventListener( 'keyup', onDocumentKeyUp, false );
  }

  updateMouse( event ) {
    event.preventDefault();
    this.mouse.x = ( event.clientX / this.container.offsetWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / this.container.offsetHeight ) * 2 + 1;
    this.checkForIntersect();
  }

  onClick( event ) {
    event.preventDefault();

    this.checkForIntersect((gridElement) => {
      // Click hover animation
      this.dispatchEvent(new CustomEvent('click', { detail: this.findParentGridElement(gridElement, 'Grid') }));
    });
  }

  checkForIntersect( callback ) {
      // TODO fix camera type error
      this.raycaster.setFromCamera( this.mouse, this.camera );
      var intersects = this.raycaster.intersectObjects( this.interactables );

      if ( intersects.length > 0 ) {

        var object = this.findParentGridElement(intersects[ 0 ].object, 'Grid');

        if ( callback ) {
          // click animation
          callback(object);
          return
        }
        if ( this.intersected !== object ) {
          // Hoveron
          this.container.style.cursor = 'pointer';
          if ( this.intersected !== null ) {
            this.unhoverAnimation(this.intersected);
          }
          this.intersected = object;
          this.hoverAnimation(this.intersected);
          return
        }

      } else {
        if ( this.intersected !== null ) {
          // Hoveroff
          this.unhoverAnimation(this.intersected);
          this.container.style.cursor = 'auto';
          this.intersected = null;
        }
      }

  }

  hoverAnimation(gridElement) {
    // console.log('Hover: ', gridElement);

    anime({
      targets: gridElement.position,
      y: this.NOMINAL_GRID_Y + 1,
      easing: 'spring(1, 80, 10, 0)',
    });

    if (gridElement.name === 'Grid c3r1') {
      anime({
        targets: this.gridElements[22].mesh.position,
        y: this.NOMINAL_GRID_Y + 1,
        easing: 'spring(1, 80, 10, 0)',
      });
    }
  }

  unhoverAnimation(gridElement) {
    // console.log('Unhover: ', gridElement);

    anime({
      targets: gridElement.position,
      y: this.NOMINAL_GRID_Y,
      easing: 'spring(1, 80, 10, 0)',
    });

    if (gridElement.name === 'Grid c3r1') {
      anime({
        targets: this.gridElements[22].mesh.position,
        y: this.NOMINAL_GRID_Y,
        easing: 'spring(1, 80, 10, 0)',
      });
    }
  }

  findParentGridElement(element, type) {
    while (element.parent !== null)
    {
       if (element.name.substring(0, 4) === type)
       {
          return element;
       }
       element = element.parent;
    }
    return null;
  }
}
