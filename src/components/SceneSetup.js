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
        this.addGround();


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
