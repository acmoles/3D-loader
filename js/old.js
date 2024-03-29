
			// Our Javascript will go here.
      import * as THREE from './node_modules/three/build/three.module.js';
      import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
      import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
      import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';
			import anime from './node_modules/animejs/lib/anime.es.js';

			//////////////////////////////
			// Global objects
			//////////////////////////////
			const camFactor = 32;
			var container = null; // Dom container
			var stats = null;
			var worldScene = null; // THREE.Scene where it all will be rendered
			var renderer = null;
			var camera = null;
			var clock = null;
			var controls = null;
			var finishedLoading = false;
			//////////////////////////////

			//////////////////////////////
			// 3D content related
			//////////////////////////////
			var gltfScene = null;
			const TRANSITION = 1;
			var animations = []; // Global animations object - pulles from loaded GLTF

			const LOADPATH = './import-test-scene/characters-export4-test-uncompressed.glb';

			var MODELS = [
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

			//////////////////////////////
			// Grid related
			//////////////////////////////

			const grid = [6, 6];
			const col = grid[0];
			const row = grid[1];
			const GRID_SIZE = col * row;
			const numberOfElements = col * row;
			const size = 4.5;
			const FINAL_GRID_POSITION = -size/21;
			const INITIAL_GRID_POSITION = -window.innerHeight/10;
			const gridAnimtionSpeed = 3000;
			const spacing = 1.5;
			var gridElements = [];
			var gridContainer;
			const gridContainerWidth = ((col-1) * size) + ((col-1) * spacing);

			//////////////////////////////
			// Interaction related
			//////////////////////////////

			var mouse = new THREE.Vector2(), INTERSECTED;
			var clickRadius = 500, theta = 0;
			var frustumSize = 1000;
			var raycaster;
			var interactables = [];

			//////////////////////////////
			// The main setup happens here
			//////////////////////////////
			initRenderer();
			initScene();
			assignInteractionEvents();
			loadModels(() => {
				startAnimationSequence();
				makeGrid();
				radialScaleGrid();
				// addGridText();
				parentModelsToGrid();
				// positionGridElements();
				// animateGridIn();
				setFinished();
			});
			animate();
			//////////////////////////////

			function loadModels(callback) {

				loadGLTF( () => {

					gltfScene.traverse( function ( child ) {

						if ( child.isMesh ) {

							if (child.name === 'Whiteboard') {
								equipMesh( getModelByName('Whiteboard'), child );
								child.scale.z = 0.95;
							}

							if (child.name === 'AntMesh') {
								equipMesh( getModelByName('Ant'), child );
							}

							if (child.name === 'ColFMesh') {
								equipMesh( getModelByName('ColF'), child );
							}

							if (child.name === 'ColMMesh') {
								equipMesh( getModelByName('ColM'), child );
							}

							if (child.name === 'Bulb') {
								child.visible = false;
								// TODO something with the bulb...
							}

						}

					});

					for ( var i = 0; i < MODELS.length; i++ ) {
						positionModel( MODELS[i] );
						rotateModel( MODELS[i] );
					}

					callback();

				} );

      }

			function equipMesh( meshobject, child ) {
				meshobject.mesh = child;
				interactables.push(meshobject.mesh);

				if (meshobject.actionSequence[0] !== null) {
					meshobject.mesh.animations = animations; // Set to globally stored animations
					let mixer = startAnimation( meshobject.mesh, meshobject.actions, meshobject.startAction );
					meshobject.mixer = mixer;
				}
			}

			function startAnimation( skinnedMesh, modelActions, startActionName ) {
				let mixer = new THREE.AnimationMixer( skinnedMesh );
				skinnedMesh.animations.forEach((animationClip) => {
					let action = mixer.clipAction( animationClip );
					modelActions[ animationClip.name ] = action;
					setWeight( modelActions[ animationClip.name ] , 0 );
				});

				// Set inital animation weight to 1 (it's nice we can key into the actions object by name)
				setWeight( modelActions[ startActionName ], 1 );

				// Start playing all actions
				for (var key in modelActions) {
					// skip loop if the property is from prototype
					if (!modelActions.hasOwnProperty(key)) continue;

					modelActions[key].play();
				}

				modelActions[ startActionName ].time = anime.random(0, 5);

				return mixer;
			}

			function startAnimationSequence() {

 				MODELS.forEach((model, i) => {
					if (model.mixer !== null) {

						// setTimout till first action in sequence
						setTimeout( () => {
							let firstAction = model.actions[ model.actionSequence[model.actionSequenceProgress] ];
							executeCrossFade( model.actions['idleStandard'], firstAction, TRANSITION );
						}, i * 10 * anime.random( 200, 600 ) );

						model.mixer.addEventListener( 'loop', function( e ) {

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

								// Crossfade out current step to idle
								executeCrossFade( model.actions[currentActionInSequence], model.actions['idleStandard'], 1 );

								// Start the next step in the sequence after a timeout
								setTimeout( () => {
									executeCrossFade( model.actions['idleStandard'], nextAction, TRANSITION );
								}, 500 * anime.random( 6, 16 ) );

							}


						} );

					}
				});
			}

			function executeCrossFade( startAction, endAction, duration ) {
				setWeight( endAction, 1 );
				endAction.time = 0;
				startAction.crossFadeTo( endAction, duration, true );
			}

			function parentModelsToGrid() {
				gridElements[19].mesh.attach(getModelByName('Whiteboard').mesh.parent);
				gridElements[13].mesh.attach(getModelByName('Ant').mesh.parent);
				gridElements[9].mesh.attach(getModelByName('ColF').mesh.parent);
				gridElements[16].mesh.attach(getModelByName('ColM').mesh.parent);
			}

			function positionGridElements() {
				gridElements.forEach( (e) => {
					e.y = INITIAL_GRID_POSITION;
					e.update();
				})
			}

			function setFinished() {
				finishedLoading = true;
			}

			function doLookdown() {
				// TODO crossfade to lookdown on click, stop action sequence, animate tile downwards
			}

			function assignInteractionEvents() {
				let container = document.getElementById('container');
				container.addEventListener( 'mousemove', updateMouse, false );
				container.addEventListener( 'mousedown', onClick, false );
				container.addEventListener( 'touchstart', onClick, false );

				// TODO mouse through pages using keyboard is nice
				// Snap to full screen position using scroll snap
				// document.addEventListener( 'keydown', onDocumentKeyDown, false );
				// document.addEventListener( 'keyup', onDocumentKeyUp, false );
			}

			function updateMouse( event ) {
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			}

			function onClick() {
				event.preventDefault();

				checkForIntersect((element) => {
					// Click hover animation
					console.log('clicked: ', element);
				});
			}

			function checkForIntersect(callback) {

				if (finishedLoading) {

					raycaster.setFromCamera( mouse, camera );
					var intersects = raycaster.intersectObjects( interactables );

					if ( intersects.length > 0 ) {

						if (callback) {
							// click animation
							callback(intersects[ 0 ].object);
							return
						}
						if ( INTERSECTED != intersects[ 0 ].object ) {
							INTERSECTED = intersects[ 0 ].object;
							console.log('intersected: ', INTERSECTED);
							// TODO iterate up parents until geometry is BoxGeometry in a method (below)

							// Do some hover animation
						}

					} else {
						// undo hover animation
						INTERSECTED = null;
					}

				}

			}

			function findParentGridElement() {

			}

			function positionModel( model ) {
				let parent = model.mesh.parent;
				parent.position.x = model.position.x;
				parent.position.y = model.position.y;
				parent.position.z = model.position.z;
			}

			function rotateModel( model ) {
				if (model.rotation !== null) {
					let parent = model.mesh.parent;
					parent.rotation.y = model.rotation.y;
				}
			}

			function loadGLTF(onload) {
				// Instantiate a loader
				var loader = new GLTFLoader();

				// Load a glTF resource
				loader.load(
					// resource URL
					LOADPATH,
					// called when the resource is loaded
					function ( gltf ) {
						// Store animations in global object
						animations = gltf.animations;
						// console.log(animations);

						// Store loaded scene in global object
						gltfScene = gltf.scene;

						worldScene.add( gltfScene );

						onload();
					},
					// called while loading is progressing
					function ( xhr ) {
						console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
					},
					// called when loading has errors
					function ( error ) {
						console.log( 'An error happened', error );
					}
				);
			}

			function setWeight( action, weight ) {
				action.enabled = true;
				action.setEffectiveTimeScale( 1 );
				action.setEffectiveWeight( weight );
			}



      function animate() {
        requestAnimationFrame( animate );


				var mixerUpdateDelta = clock.getDelta();

				for ( var i = 0; i < MODELS.length; ++ i ) {
					if (MODELS[ i ].mixer !== null) {
						MODELS[ i ].mixer.update( mixerUpdateDelta );
					}
				}

				checkForIntersect();


        renderer.render( worldScene, camera );
        stats.update();
      }


			function animateGridIn() {
				// TODO delay until loaded
				const staggersAnimation = anime.timeline({
				  targets: gridElements,
				  easing: 'spring(1, 100, 13, 0)',
				  autoplay: false
				})
				.add({
					duration: gridAnimtionSpeed,
					y: FINAL_GRID_POSITION,
					update: renderAnimation,
					delay: anime.stagger(100, {grid: grid, from: 'first'})
				});

				setTimeout( () => {
					staggersAnimation.play();
				}, 500);
			}

			function radialScaleGrid() {
				let radialGroups = [
					[14, 15, 20, 21],
					[8, 9, 13, 16, 19, 22, 26, 27],
					[2, 3, 7, 10, 12, 17, 18, 23, 25, 28, 32, 33],
					[1, 4, 6, 11, 24, 29, 31, 34],
					[0, 5, 30, 35]
				]

				for (var i = 0; i < radialGroups.length; i++) {
					for (var j = 0; j < radialGroups[i].length; j++) {
						let e = gridElements[radialGroups[i][j]];
						let scale = 1 - (i*0.1);
						e.scaleX = scale;
						e.scaleZ = scale;
						e.update();
					}
				}

			}

			function radialScaleGridAlt() {

				let radius = 2;
				let pr = 3;
				let pc = 2;

				for (var i = 0; i < col - 1; i++) {
					scaleSegments(pr, pc, i, 1 - (i*0.08));
				}
				let finalScale = 1 - ((col - 2)*0.08);
				gridElements[5].scaleX = finalScale;
				gridElements[5].scaleZ = finalScale;
				gridElements[5].update();

			}

			function scaleSegments(pc, pr, radius, scale) {
				for (var c = pc - radius; c <= pc + radius; c++) {
						if(c < 0 || c >= GRID_SIZE) continue;

						for (var r = pr - radius; r < pr + radius; r++) {
						if(r < 0 || r >= GRID_SIZE) continue;

						var d = getDistance(pr, pc, r, c);
						if(d < radius - 1 || d > radius) continue;

						gridElements.forEach((e) => {
							if (e.name === 'c' + Math.round(c) + 'r' + Math.round(r)) {
								// console.log('found: ', e.name);
								e.scaleX = scale;
								e.scaleZ = scale;
								e.update();
							}
						});

						}
				}
			}

			function getDistance(x1, y1, x2, y2) {
			    var a = x1 - x2, b = y1 - y2;
			    return Math.sqrt( a*a + b*b );
			}

			function renderAnimation(anim) {
			  for (var i = 0; i < anim.animatables.length; i++) {
			    anim.animatables[i].target.update();
			  }
			}

			function makeGrid () {

				gridContainer = new THREE.Object3D();

				var gridMaterial = new THREE.MeshBasicMaterial({
					color: 0xE2EAF4
				});

				for (var c=0; c<col; c++) {
						for (var r=0; r<row; r++) {

								var x = c * (size + spacing);
								var z = r * (size + spacing);
								var y = FINAL_GRID_POSITION;
								var name = 'c' + c + 'r' + r;

								var element = makeGridElement(x, y, z, size, gridMaterial, name)

								gridElements.push(element);
								gridContainer.add(element.mesh);
								interactables.push(element.mesh);
						}
				}
				gridContainer.rotation.y = 0.5 * Math.PI;

				gridContainer.position.x = gridContainer.position.x - (gridContainerWidth/2);
				gridContainer.position.z = gridContainer.position.z + (gridContainerWidth/2);
				worldScene.add(gridContainer);

				// console.log('length of elements: ', gridElements);
				// console.log('intended length: ', numberOfElements);

			}

			function makeGridElement(x, y, z, s, material, name) {
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

				e.update = () => {
					e.mesh.position.y = e.y;
					e.mesh.scale.x = e.scaleX;
					e.mesh.scale.z = e.scaleZ;
				}

				e.name = name;

				return e;
			}

			function addGridText() {
				// TODO temporary text label

				var textContainer = new THREE.Object3D();

				var textMaterial = new THREE.MeshBasicMaterial({
					color: 0x222222
				});

				var globalCounter = 0;

				var loader = new THREE.FontLoader();

				loader.load( './node_modules/three/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {

					for (var c=0; c<col; c+=1) {
							for (var r=0; r<row; r+=1) {

									var geometry = new THREE.TextGeometry( globalCounter.toString(), {
										font: font,
										size: 1,
										height: 0.1,
									} );

									var element = new THREE.Mesh(geometry, textMaterial);
									element.position.x = c * (size + spacing);
									element.position.z = r * (size + spacing);

									textContainer.add(element);

									globalCounter++;
							}
					}
					textContainer.rotation.y = 0.5 * Math.PI;

					textContainer.position.x = textContainer.position.x - (gridContainerWidth/2);
					textContainer.position.z = textContainer.position.z + (gridContainerWidth/2);
					worldScene.add(textContainer);

				} );
			}

			function initRenderer() {
				container = document.createElement( 'div' );
				container.id = 'container';
				document.body.appendChild( container );

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.gammaOutput = true;
				container.appendChild( renderer.domElement );

				// stats
				stats = new Stats();
				container.appendChild( stats.dom );

				clock = new THREE.Clock();

				// raycaster
				raycaster = new THREE.Raycaster();

			}

			function initScene(callbackInit) {

				let width = window.innerWidth;
				let height = window.innerHeight;
				camera = new THREE.OrthographicCamera( width / - camFactor, width / camFactor, height / camFactor, height / - camFactor, 1, 1000 );
				camera.position.set( 33, 30, 33 );
				worldScene = new THREE.Scene();
				worldScene.background = new THREE.Color( 0xFFFFFF )
				// var axesHelper = new THREE.AxesHelper( 5 );
				// worldScene.add( axesHelper );

				controls = new OrbitControls( camera, renderer.domElement );
				controls.target.set( 0, 5.5, 0 );

				// TODO add these to restrict user camera
				// let maxAngle = (7 / 20) * Math.PI;
				// controls.maxPolarAngle = maxAngle;
				// controls.minPolarAngle = maxAngle;
				// controls.enableZoom = false;
				// controls.enablePan = false;

				controls.update();

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {
				let width = window.innerWidth;
				let height = window.innerHeight;

				renderer.setSize( width, height );

				camera.left = width / - camFactor;
				camera.right = width / camFactor;
				camera.top = height / camFactor;
				camera.bottom = height / - camFactor;

			 camera.updateProjectionMatrix();
			}

			function getModelByName( name ) {
				for ( var i = 0; i < MODELS.length; ++ i ) {
					if ( MODELS[ i ].name === name ) {
						return MODELS[ i ];
					}
				}
				return null;
			}



			// Redundant

			// Optional: Provide a DRACOLoader instance to decode compressed mesh data
			// DRACOLoader.setDecoderPath( './node_modules/three/examples/js/libs/draco/' );
			// loader.setDRACOLoader( new DRACOLoader() );

			// Optional: Pre-fetch Draco WASM/JS module, to save time while parsing.
			// DRACOLoader.getDecoderModule();

			function loadTexture(callback) {
        // instantiate a loader
        var loader = new THREE.ImageLoader();

        // load a image resource
        loader.load(
        	// resource URL
        	'./import-test-scene/palette-web.png',

        	// onLoad callback
        	function ( image ) {
            callback(image);
        	},

        	// onProgress callback currently not supported
        	undefined,

        	// onError callback
        	function () {
        		console.error( 'An error happened loading the texture.' );
        	}
        );
      }
