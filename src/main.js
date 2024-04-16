import { SceneSetup } from './components/SceneSetup.js';
import { PhysicsWorld } from './components/PhysicsWorld.js';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger'
import gsap from 'gsap';

import Stats from 'stats.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#app');
    const sceneSetup = new SceneSetup(container);
    const physicsWorld = new PhysicsWorld();

    const stats = new Stats();
    document.body.appendChild(stats.dom);


    //await sceneSetup.addRover();
    let roverMesh;

    physicsWorld.addTestObject().then(testObject => {
        // Test object has been loaded and added to the physics world
        console.log('Test object added to the physics world:', testObject);
    }
    ).catch(error => {
        // Handle any errors
        console.error('Failed to load the test object:', error);
    });

    sceneSetup.addRover().then(rover => {
        // Rover has been loaded and added to the scene
        roverMesh = rover;
        console.log('Rover added to the scene:', rover);
    }).catch(error => {
        // Handle any errors
        console.error('Failed to load the rover:', error);
    });

    // physicsWorld.addMap().then(mapBody => {
    //     // Map has been loaded and added to the physics world
    //     console.log('Map added to the physics world:', mapBody);
    // }).catch(error => {
    //     // Handle any errors
    //     console.error('Failed to load the map:', error);
    // });

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
        if (event.key === 'z' || event.key === 's' || event.key === 'q' || event.key === 'd') {
            event.preventDefault();
            // create 2 set of orange particles and add them to the scene, create tje particles on the left and right side of the rover
            const particles = new THREE.Group();
            sceneSetup.scene.add(particles);
            const particles2 = new THREE.Group();
            sceneSetup.scene.add(particles2);
            const particleGeometry = new THREE.SphereGeometry(0.05, Math.floor(Math.random() * (32 - 10 + 1)) + 10, Math.floor(Math.random() * (32 - 10 + 1)) + 10);
            const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
            particleMaterial.color = randomColor;
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            const particle2 = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.copy(car.chassisBody.position);
            particle2.position.copy(car.chassisBody.position);
            const roverRotation = car.chassisBody.quaternion;
            const randomPosition = Math.random() * (2.2 - 1.8) + 1.8;
            const adjustedPosition = new THREE.Vector3(1.6, -1.5, -randomPosition).applyQuaternion(roverRotation);
            const adjustedPosition2 = new THREE.Vector3(1.6, -1.5, randomPosition).applyQuaternion(roverRotation);
            particle.position.add(adjustedPosition);
            particle2.position.add(adjustedPosition2);
            particles.add(particle);
            particles2.add(particle2);
            gsap.to(particle.position, { 
                x: particle.position.x + Math.random() * 2 - 1,
                y: particle.position.y + Math.random() * 1 - 0.5,
                z: particle.position.z + Math.random() * 1 - 0.5,
                duration: Math.random() * 1.9 + 1.1, 
                ease: "power2.inOut", 
                onComplete: () => {
                    gsap.to(particle.position, { 
                        x: particle.position.x - Math.random() * 2 - 1,
                        y: particle.position.y - Math.random() * 1 - 0.5,
                        z: particle.position.z - Math.random() * 1 - 0.5,
                        duration: Math.random() * 0.9 + 0.1, 
                        ease: "power2.inOut", 
                        onComplete: () => {
                            sceneSetup.scene.remove(particles);
                        }
                    });
                }
            });
            gsap.to(particle2.position, { 
                x: particle2.position.x + Math.random() * 2 - 1,
                y: particle2.position.y + Math.random() * 1 - 0.5,
                z: particle2.position.z + Math.random() * 1 - 0.5,
                duration: Math.random() * 1.9 + 1.1, 
                ease: "power2.inOut", 
                onComplete: () => {
                    gsap.to(particle2.position, { 
                        x: particle2.position.x - Math.random() * 2 - 1,
                        y: particle2.position.y - Math.random() * 1 - 0.5,
                        z: particle2.position.z - Math.random() * 1 - 0.5,
                        duration: Math.random() * 0.9 + 0.1, 
                        ease: "power2.inOut", 
                        onComplete: () => {
                            sceneSetup.scene.remove(particles2);
                        }
                    });
                }
            });
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
        sceneSetup.camera.position.copy(car.chassisBody.position).add(new THREE.Vector3(-car.chassisBody.velocity.x+3, 10, -car.chassisBody.velocity.z+3));
        sceneSetup.camera.lookAt(car.chassisBody.position);
        sceneSetup.controls.update();

        // gsap.to(bonus, {
        //     color: "red",
        //     duration: 1,
        //     repeat: -1,
        //     yoyo: true

        // });

        stats.end();

        sceneSetup.animate();
    }

    animate();
});
