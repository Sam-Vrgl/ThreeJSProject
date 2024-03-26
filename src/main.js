import { SceneSetup } from './components/SceneSetup.js';
import { PhysicsWorld } from './components/PhysicsWorld.js';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger'

import Stats from 'stats.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#app');
    const sceneSetup = new SceneSetup(container);
    const physicsWorld = new PhysicsWorld();

    const stats = new Stats();
    document.body.appendChild(stats.dom);

    // Add ground

    // physicsWorld.addGround();
    // Attempt to load and add the map
    physicsWorld.addMap().then(({ threeObject, cannonBody }) => {
        console.log('Map added to the physics world:', cannonBody);
    }).catch(error => {
        console.error('Failed to load the map:', error);
    });

    //await sceneSetup.addRover();
    let roverMesh;

    sceneSetup.addRover().then(rover => {
        // Rover has been loaded and added to the scene
        roverMesh = rover;
        console.log('Rover added to the scene:', rover);
    }).catch(error => {
        // Handle any errors
        console.error('Failed to load the rover:', error);
    });

    physicsWorld.addMap().then(mapBody => {
        // Map has been loaded and added to the physics world
        console.log('Map added to the physics world:', mapBody);
    }).catch(error => {
        // Handle any errors
        console.error('Failed to load the map:', error);
    });

    sceneSetup.addMap().then(Tiles => {
        // Map has been loaded and added to the physics world
        console.log('Map added to the physics world:', Tiles);
    }).catch(error => {
        // Handle any errors
        console.error('Failed to load the map:', error);
    });


    // const sphereBody = physicsWorld.addSphere();
    const cannonDebugger = new CannonDebugger(sceneSetup.scene, physicsWorld.world);
    const car = physicsWorld.addVehicle();





    // In main.js
    const input = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        brake: false
    };

    let start = false;

    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'w':
            case 'z': // Forward
                input.forward = true;
                break;
            case 's': // Backward
                input.backward = true;
                break;
            case 'a':
            case 'q': // Left
                input.left = true;
                break;
            case 'd': // Right
                input.right = true;
                break;
            case ' ': // Space
                input.brake = true;
                break;
            case '1':
                start = !start;
                break;
        }
    });

    document.addEventListener('keyup', (event) => {
        switch (event.key) {
            case 'w':
            case 'z': // Forward
                input.forward = false;
                break;
            case 's': // Backward
                input.backward = false;
                break;
            case 'a':
            case 'q': // Left
                input.left = false;
                break;
            case 'd': // Right
                input.right = false;
                break;
            case ' ': // Space
                input.brake = false;
                break;
        }
    });



    function animate() {
        requestAnimationFrame(animate);

        stats.begin();
        physicsWorld.update(1 / 60); // Assuming 60fps
        const deltaTime = 1 / 60;
        cannonDebugger.update()
        physicsWorld.controlCar(input, car);

        if (roverMesh) { // Ensure roverMesh is loaded
            roverMesh.position.copy(car.chassisBody.position);
            roverMesh.quaternion.copy(car.chassisBody.quaternion);
            roverMesh.position.y += 0.5; // Adjust the height of the rover
            // Apply the adjustment quaternion to the roverMesh's quaternion to correct orientation
            const adjustmentQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
            roverMesh.quaternion.multiply(adjustmentQuaternion);
            roverMesh.scale.set(5, 5, 5);
        }
        // sceneSetup.camera.position.copy(car.chassisBody.position).add(new CANNON.Vec3(0, 10, 20));

        // sceneSetup.controls.update();

        stats.end();

        sceneSetup.animate();
    }

    animate();
});
