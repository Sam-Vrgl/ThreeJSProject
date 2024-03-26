// src/components/SceneSetup.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';



export class SceneSetup {
    constructor(container) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();

        this.axesHelper = new THREE.AxesHelper(5);
        this.scene.add(this.axesHelper);

        this.addLight();


        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.camera.position.set(0, 5, 10); // Adjust as needed
        this.controls.update();
    }

    addLight() {
        const light = new THREE.DirectionalLight(0xffffff, 10);
        light.position.set(10, 10, 10);
        this.scene.add(light);

        const ambientLight = new THREE.AmbientLight(0xffffff, 10);
        this.scene.add(ambientLight);

    }

    addGround() {
        return new Promise((resolve, reject) => {
            const gltfLoader = new GLTFLoader();
            gltfLoader.load('./public/objects/TestMap.glb', (gltf) => {
                console.log(gltf);
                const Map = gltf.scene;
                Map.scale.set(10, 10, 10);
                Map.position.set(0, 6, 0);
                this.scene.add(Map);
                resolve(Map); // Resolve the promise with the loaded rover
            }, undefined, error => {
                reject(error); // Reject the promise if there's an error
            });
        });
    }

    addMap() {
        return new Promise((resolve, reject) => {
            const gltfLoader = new GLTFLoader();
            gltfLoader.load('./public/objects/Tile1.glb', (gltf) => {
                console.log(gltf);
                const Tile = gltf.scene.children[0];

                let x = 0, y = 0; // Initial position
                let direction = 0; // 0: right, 1: up, 2: left, 3: down
                let steps = 1; // Steps to move in the current direction
                let stepCounter = 0; // Counter for steps taken in current direction
                let directionChange = 0; // Counter for changing direction, increases step after 2 changes
                let dx = [1, 0, -1, 0]; // Change in x for each direction
                let dy = [0, 1, 0, -1]; // Change in y for each direction

                // Total tiles to generate
                let totalTiles = 30;

                for (let i = 0; i < totalTiles; i++) {
                    // Clone and position the tile
                    const TileClone = Tile.clone();
                    TileClone.scale.set(5, 5, 5);
                    TileClone.position.set(x * 10, 6, y * 10);
                    this.scene.add(TileClone);

                    // Move
                    x += dx[direction];
                    y += dy[direction];
                    stepCounter++;

                    // Change direction if needed
                    if (stepCounter == steps) {
                        direction = (direction + 1) % 4; // Cycle through directions
                        stepCounter = 0; // Reset step counter
                        directionChange++;

                        // Increase steps every 2 direction changes (a full cycle around the spiral)
                        if (directionChange % 2 == 0) {
                            steps++;
                        }
                    }
                }
                resolve(Tile); // Resolve the promise with the loaded rover
            }, undefined, error => {
                reject(error); // Reject the promise if there's an error
            });
        });
    }



    addSphere() {
        const sphereGeometry = new THREE.SphereGeometry(1, 32, 32); // Radius, WidthSegments, HeightSegments
        const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphereMesh.position.set(0, 5, 0); // Position it 5 units above the ground
        this.scene.add(sphereMesh);
        return sphereMesh;
    }

    addRover() {
        return new Promise((resolve, reject) => {
            const gltfLoader = new GLTFLoader();
            gltfLoader.load('./public/objects/rover.glb', (gltf) => {
                const rover = gltf.scene;
                this.scene.add(rover);
                this.controls.target = rover.position; // Set the camera to look at the rover
                resolve(rover); // Resolve the promise with the loaded rover
            }, undefined, error => {
                reject(error); // Reject the promise if there's an error
            });
        });
    }


    animate = () => {
        this.renderer.render(this.scene, this.camera);
    }
}
