// src/components/SceneSetup.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';



export class SceneSetup {

    // Constructor to set up the scene, camera, renderer, and controls
    constructor(container) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.shadowMap.enabled = true;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);
        this.clock = new THREE.Clock();
        this.addLight();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.camera.position.set(0, 5, 10); 
        this.controls.update();
    }

    addLight() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
        directionalLight.position.set(120, 50, 120);
        // Set up shadow properties for the light
        directionalLight.castShadow = true; 
        directionalLight.shadow.mapSize.width = 4096*2; 
        directionalLight.shadow.mapSize.height = 4096*2;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 5000;
        directionalLight.shadow.camera.left = -500;
        directionalLight.shadow.camera.right = 500;
        directionalLight.shadow.camera.top = 500;
        directionalLight.shadow.camera.bottom = -500;
    
        this.scene.add(directionalLight);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.05); 
        this.scene.add(ambientLight);
    
    }
    
    // Function to add the ground plane
    addGround() {
        const loader = new THREE.TextureLoader();

        const diffuse = loader.load('./public/textures/ground/Ground_Dirt_008_baseColor.jpg');
        const normalMap = loader.load('./public/textures/ground/Ground_Dirt_008_normal.jpg');
        const displacementMap = loader.load('./public/textures/ground/Ground_Dirt_008_height.png');
        const roughnessMap = loader.load('./public/textures/ground/Ground_Dirt_008_roughness.jpg');
        const aoMap = loader.load('./public/textures/ground/Ground_Dirt_008_ambientOcclusion.jpg');

        const repeatS = 30;
        const repeatT = 30;

        [diffuse, normalMap, displacementMap, roughnessMap, aoMap].forEach(tex => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(repeatS, repeatT);
        });

        const material = new THREE.MeshStandardMaterial({
            map: diffuse,
            normalMap: normalMap,
            displacementMap: displacementMap,
            roughnessMap: roughnessMap,
            aoMap: aoMap,
            displacementScale: 0.2,
        });

        const marsColor = new THREE.Color('rgb(205, 92, 92)');
        material.color.multiply(marsColor);

        const planeGeometry = new THREE.PlaneGeometry(500, 500, 1, 1);
        const groundPlane = new THREE.Mesh(planeGeometry, material);
        groundPlane.rotation.x = -Math.PI / 2;
        groundPlane.receiveShadow = true;
        this.scene.add(groundPlane);

    }

    // Function to load shared obstacle materials
    loadSphereTexture() {
        const textureLoader = new THREE.TextureLoader();

        // Load textures
        const diffuse = textureLoader.load('./public/textures/rocks/Rock_045_BaseColor.jpg');
        const aoMap = textureLoader.load('./public/textures/rocks/Rock_045_AmbientOcclusion.jpg');
        const normalMap = textureLoader.load('./public/textures/rocks/Rock_045_Normal.jpg');
        const roughnessMap = textureLoader.load('./public/textures/rocks/Rock_045_Roughness.jpg');
        const heightMap = textureLoader.load('./public/textures/rocks/Rock_045_Height.png');
        
        // Create material with textures
        const material = new THREE.MeshStandardMaterial({
          map: diffuse,
          aoMap: aoMap,
          normalMap: normalMap,
          roughnessMap: roughnessMap,
          displacementMap: heightMap,
          displacementScale: 0.1, 
        });
        return material;
    }

    // Function to create a half-sphere obstacle
    createHalfSphere(radius, position, material) {
        const sphereGeom = new THREE.SphereGeometry(radius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const halfSphere = new THREE.Mesh(sphereGeom, material);
        halfSphere.position.set(position.x, position.y, position.z);
        return halfSphere;
    }

    // Function to load shared pillar materials
    loadPillarTexture() {
        const textureLoader = new THREE.TextureLoader();

        // Load textures
        const diffuse = textureLoader.load('./public/textures/pillars/Rock_044_BaseColor.jpg');
        const aoMap = textureLoader.load('./public/textures/pillars/Rock_044_AmbientOcclusion.jpg');
        const normalMap = textureLoader.load('./public/textures/pillars/Rock_044_Normal.jpg');
        const roughnessMap = textureLoader.load('./public/textures/pillars/Rock_044_Roughness.jpg');
        const heightMap = textureLoader.load('./public/textures/pillars/Rock_044_Height.png');
        
        // Create material with textures
        const material = new THREE.MeshStandardMaterial({
          map: diffuse,
          aoMap: aoMap,
          normalMap: normalMap,
          roughnessMap: roughnessMap,
          displacementMap: heightMap,
          displacementScale: 0.1, // This needs to be tuned depending on your height map and needs
        });
        return material;
    }

    // Function to create a pillar obstacle
    createPillar(radiusTop, radiusBottom, height, position, material) {
        const cylinderGeom = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 32);
        const cylinder = new THREE.Mesh(cylinderGeom, material);
        cylinder.position.set(position.x, position.y + height / 2, position.z); // Position is set at the base of the cylinder
        return cylinder;
    }

    // Function to add obstacles to the scene
    addObstacles() {
        const numberOfHalfSpheres = 300;
        const numberOfCylinders = 20;
        const planeSize = 500;
        const sphereMaterial = this.loadSphereTexture();
        const pillarMaterial = this.loadPillarTexture();
    
        // Arrays to store properties of spheres and cylinders
        let sphereData = [];
        let pillarData = [];
    
        // Create half-spheres
        for (let i = 0; i < numberOfHalfSpheres; i++) {
            const radius = Math.random() * 5 + 2; // Random radius between 2 and 7
            let position = new THREE.Vector3(
                (Math.random() - 0.5) * planeSize,
                (radius / 2)-(radius/3)-1,
                (Math.random() - 0.5) * planeSize
            );

            while (position.length() < 10) {
                position = new THREE.Vector3(
                    (Math.random() - 0.5) * planeSize,
                    (radius / 2)-(radius/3)-1,
                    (Math.random() - 0.5) * planeSize
                );
            }

            const halfSphere = this.createHalfSphere(radius, position, sphereMaterial);
            halfSphere.castShadow = true; 
            halfSphere.receiveShadow = true;
            this.scene.add(halfSphere);
            sphereData.push({ radius, position });
        }
    
        // Create cylinders
        for (let i = 0; i < numberOfCylinders; i++) {
            const radius = Math.random() * 5 + 5; // Random radius between 5 and 10
            const height = Math.random() * 20 + 10; // Random height between 10 and 30
            let position = new THREE.Vector3(
                (Math.random() - 0.5) * planeSize,
                0,
                (Math.random() - 0.5) * planeSize
            );

            while (position.length() < 10) {
                position = new THREE.Vector3(
                    (Math.random() - 0.5) * planeSize,
                    (radius / 2)-(radius/3)-1,
                    (Math.random() - 0.5) * planeSize
                );
            }

            const cylinder = this.createPillar(radius, radius, height, position, pillarMaterial);
            cylinder.castShadow = true;
            cylinder.receiveShadow = true;
            this.scene.add(cylinder);
            pillarData.push({ radius, height, position });
        }
    
        return { spheres: sphereData, pillars: pillarData };
    }

    // Function to load the rover model
    addRover() {
        return new Promise((resolve, reject) => {
            const gltfLoader = new GLTFLoader();
            gltfLoader.load('./public/objects/rover.glb', (gltf) => {
                const rover = gltf.scene;
                rover.castShadow = true;
                rover.receiveShadow = true;
                console.log("rouver", rover);
                this.scene.add(rover);
                this.controls.target = rover.position; // Set the camera to look at the rover
                resolve(rover); // Resolve the promise with the loaded rover
            }, undefined, error => {
                reject(error); // Reject the promise if there's an error
            });
        });
    }

    // Function to add the end zone
    addEndZone() {
        const endX = Math.floor(Math.random() * (100 - 70 + 1)) + 70;
        const endZ = Math.floor(Math.random() * (100 - 70 + 1)) + 70;
    
        const cylinderGeometry = new THREE.CylinderGeometry(10, 10, 20, 32);
        const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 }); // changed opacity to 0.5 for better visibility
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    

        cylinderMesh.position.set(endX, 10, endZ); 
        cylinderMesh.scale.y = 100; 
    
        this.scene.add(cylinderMesh);
        return cylinderMesh;
    }
    
    // Function to update the scene
    animate = () => {
        this.renderer.render(this.scene, this.camera);
    }
}
