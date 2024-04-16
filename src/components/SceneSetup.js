// src/components/SceneSetup.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';



export class SceneSetup {
    constructor(container) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.shadowMap.enabled = true;
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
        const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
        directionalLight.position.set(120, 50, 120);
        directionalLight.castShadow = true; // Enable shadows for this light
    
        directionalLight.shadow.mapSize.width = 4096*2; // Optional: Increase shadow resolution
        directionalLight.shadow.mapSize.height = 4096*2;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 5000;
        directionalLight.shadow.camera.left = -500;
        directionalLight.shadow.camera.right = 500;
        directionalLight.shadow.camera.top = 500;
        directionalLight.shadow.camera.bottom = -500;
    
        this.scene.add(directionalLight);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Reduce ambient light intensity
    
    }
    

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
          displacementScale: 0.1, // This needs to be tuned depending on your height map and needs
        });
        return material;
    }

    createHalfSphere(radius, position, material) {
        const sphereGeom = new THREE.SphereGeometry(radius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const halfSphere = new THREE.Mesh(sphereGeom, material);
        halfSphere.position.set(position.x, position.y, position.z);
        return halfSphere;
    }

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


    createPillar(radiusTop, radiusBottom, height, position, material) {
        const cylinderGeom = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 32);
        const cylinder = new THREE.Mesh(cylinderGeom, material);
        cylinder.position.set(position.x, position.y + height / 2, position.z); // Position is set at the base of the cylinder
        return cylinder;
    }

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
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * planeSize,
                (radius / 2)-(radius/3)-1,
                (Math.random() - 0.5) * planeSize
            );
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
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * planeSize,
                0,
                (Math.random() - 0.5) * planeSize
            );
            const cylinder = this.createPillar(radius, radius, height, position, pillarMaterial);
            cylinder.castShadow = true;
            cylinder.receiveShadow = true;
            this.scene.add(cylinder);
            pillarData.push({ radius, height, position });
        }
    
        return { spheres: sphereData, pillars: pillarData };
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
                    TileClone.position.set(x * 10 + 5, 0.1, y * 10 + 5);
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
    


    animate = () => {
        this.renderer.render(this.scene, this.camera);
    }
}
