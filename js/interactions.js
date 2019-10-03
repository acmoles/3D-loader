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

    this.hasEvents = true;
    this.hoverOns = [];
    this.hoverOffs = [];
  }

  init() {
      this.NOMINAL_GRID_Y = this.gridElements[0].y;
      this.HOVER_Y = this.NOMINAL_GRID_Y + 0.25;

      this.container.addEventListener( 'mousemove', this.updateMouse.bind(this), false );
      this.container.addEventListener( 'mousedown', this.onClick.bind(this), false );
      this.container.addEventListener( 'touchstart', this.onClick.bind(this), false );

      updateOnScroll(0, (window.innerHeight / 1.5), progress => {
       this.dispatchEvent( new CustomEvent('scroll', { detail: progress }) );
       if (this.hasEvents && progress > 0) {
         this.stopEvents();
       } else if (!this.hasEvents && progress === 0) {
         this.allowEvents();
       }
      });
  }

  allowEvents() {
    this.hasEvents = true;
  }

  stopEvents() {
    this.hasEvents = false;
    this.dispatchEvent(new Event('pause-external'));
    if (this.hoverOns[0]) { this.hoverOns.forEach( (h) => { h.pause(); } ); this.hoverOns = []; }
    if (this.hoverOffs[0]) { this.hoverOffs.forEach( (h) => { h.pause(); } ); this.hoverOffs = []; }
  }

  updateMouse( event ) {
    event.preventDefault();
    this.mouse.x = ( event.clientX / this.container.offsetWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / this.container.offsetHeight ) * 2 + 1;
    if (this.hasEvents) {
      this.checkForIntersect();
    }
  }

  onClick( event ) {
    event.preventDefault();

    if (this.hasEvents) {
      this.checkForIntersect((gridElement) => {
        // Click animation
        this.intersected = null;
        this.dispatchEvent(new CustomEvent('click', { detail: this.findParentGridElement(gridElement, 'Grid') }));
      });
    }
  }

  checkForIntersect( callback ) {
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
            // Hover switch
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
    if (this.hasEvents) {

      this.hoverOnInternal(gridElement.position);

      // if (gridElement.name === 'Grid c3r1') {
      //   this.hoverOnInternal(this.gridElements[22].mesh.position);
      // } else if (gridElement.name === 'Grid c3r4') {
      //   this.hoverOnInternal(this.gridElements[19].mesh.position);
      // }

    }
  }

  hoverOnInternal(target) {
    target.y = this.NOMINAL_GRID_Y;
    this.hoverOns.push(anime({
      targets: target,
      y: this.HOVER_Y,
      easing: 'spring(1, 100, 10, 10)',
      duration: 200,
      complete: () => { this.hoverOns = []; }
    }));
  }

  unhoverAnimation(gridElement) {
    if (this.hasEvents) {

      this.unhoverInternal(gridElement.position);

      // if (gridElement.name === 'Grid c3r1') {
      //   this.unhoverInternal(this.gridElements[22].mesh.position);
      // } else if (gridElement.name === 'Grid c3r4') {
      //   this.unhoverInternal(this.gridElements[19].mesh.position);
      // }

    }
  }

  unhoverInternal(target) {
    this.hoverOffs.push(anime({
      targets: target,
      y: this.NOMINAL_GRID_Y,
      easing: 'spring(1, 100, 10, 0)',
      duration: 800,
      complete: () => { this.hoverOffs = []; }
    }));
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
