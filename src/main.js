import { SceneSetup } from './components/SceneSetup.js';
import { PhysicsWorld } from './components/PhysicsWorld.js';
import * as THREE from 'three';
import gsap from 'gsap';

import Stats from 'stats.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#app');
    const sceneSetup = new SceneSetup(container);
    const physicsWorld = new PhysicsWorld();

    const stats = new Stats();
    document.body.appendChild(stats.dom);

    //All code relevant to the timer

    let timerStart = null;
    let timerInterval = null;
    let gameWon = false; 
    let gameStarted = false;

    const startGameButton = document.getElementById('startGame');
    startGameButton.addEventListener('click', function() {
        document.getElementById('instructionModal').style.display = 'none';
        gameStarted = true; // Enable game controls
    });

    function startTimer() {
        if (!timerStart) {
            timerStart = Date.now();
            timerInterval = setInterval(() => {
                const elapsed = ((Date.now() - timerStart) / 1000).toFixed(1);
                displayTimer(elapsed);
            }, 100);
        }
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }



    function displayTimer(time) {
        let timerDiv = document.getElementById('timer');
        if (!timerDiv) {
            timerDiv = document.createElement('div');
            timerDiv.id = 'timer';
            timerDiv.style.position = 'absolute';
            timerDiv.style.top = '10px';
            timerDiv.style.right = '10px';
            timerDiv.style.fontSize = '20px';
            timerDiv.style.color = 'white'; 
            document.body.appendChild(timerDiv);
        }
        timerDiv.textContent = `Time: ${time} s`;
    }

    function stopTimerAndShowModal() {
        stopTimer();
        const elapsed = ((Date.now() - timerStart) / 1000).toFixed(1);
        document.getElementById('finalTime').textContent = elapsed;
        displayHighScores(); // Display the top 5 high scores
        document.getElementById('congratulationsModal').style.display = 'block';
    }
    
    function displayHighScores() {
        const highscores = JSON.parse(localStorage.getItem('highscores')) || [];
        // Sort the highscores by time in ascending order
        highscores.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
        // Limit to top 5 high scores
        const topScores = highscores.slice(0, 5);
        const highScoreList = document.getElementById('highScoreList');
        highScoreList.innerHTML = ''; // Clear existing list
        topScores.forEach(score => {
            const listItem = document.createElement('li');
            listItem.textContent = `${score.name} - ${score.time} seconds`;
            highScoreList.appendChild(listItem);
        });
    }
    
    const submitBtn = document.getElementById('submitHighscore');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            saveHighscore();
        });
    } else {
        console.log('Submit button not found');
    }

    const clearHighscoresBtn = document.getElementById('clearHighscores');
    clearHighscoresBtn.addEventListener('click', function() {
        localStorage.removeItem('highscores'); // Remove the highscores from local storage
        document.getElementById('highScoreList').innerHTML = ''; // Clear the highscore list display
        console.log('Highscores cleared');
    });
    
    function saveHighscore() {
        const playerName = document.getElementById('playerName').value;
        const finalTime = document.getElementById('finalTime').textContent;
        if (!playerName) {
            alert('Please enter your name.');
            return;
        }
        const highscores = JSON.parse(localStorage.getItem('highscores')) || [];
        highscores.push({ name: playerName, time: finalTime });
        localStorage.setItem('highscores', JSON.stringify(highscores));
        document.getElementById('congratulationsModal').style.display = 'none';
        console.log('Highscore saved:', playerName, finalTime);
    }
    




    //Code relevant to the game setup
    let roverMesh;

    sceneSetup.addRover().then(rover => {
        roverMesh = rover;
        console.log('Rover added to the scene:', rover);
    }).catch(error => {
        console.error('Failed to load the rover:', error);
    });

    physicsWorld.addGround()
    sceneSetup.addGround()

    const obstacles = sceneSetup.addObstacles();
    physicsWorld.addObstacles(obstacles);

    const car = physicsWorld.addVehicle();

    const endZoneMesh = sceneSetup.addEndZone();


    //Code relevant to the endzone detection
    function checkCollision(roverMesh, endZoneMesh) {
        if (!roverMesh || !endZoneMesh || gameWon) return false; 
        const roverBox = new THREE.Box3().setFromObject(roverMesh);
        const endZoneBox = new THREE.Box3().setFromObject(endZoneMesh);
        if (roverBox.intersectsBox(endZoneBox)) {
            console.log('You win!');
            if (!gameWon) { 
                stopTimerAndShowModal();
                gameWon = true; 
            }
            return true;
        }
        return false;
    }
    
    //All input code
    const input = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        brake: false
    };

    let start = false;

    document.addEventListener('keydown', (event) => {


        const modal = document.getElementById('congratulationsModal');
        const isFocusedInsideModal = modal.contains(document.activeElement);
        const isInputFocused = document.activeElement.tagName === 'INPUT';
    
        // If the focus is inside the modal or on any input, return early
        if (isFocusedInsideModal || isInputFocused) {
            return;
        }

        startTimer();
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
            // create 2 set of orange particles and add them to the scene, create the particles on the left and right side of the rover
            const particles = new THREE.Group();
            sceneSetup.scene.add(particles);
            const particles2 = new THREE.Group();
            sceneSetup.scene.add(particles2);
            const particleGeometry = new THREE.SphereGeometry(0.1, Math.floor(Math.random() * (32 - 10 + 1)) + 10, Math.floor(Math.random() * (32 - 10 + 1)) + 10);
            const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
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


    //All code relevant to the game reestart

    function resetGame() {
        // Reset game state variables
        gameWon = false;
    
        // Reset timer
        stopTimer();
        timerStart = null;
        displayTimer(0); // Reset timer display to 0
    
        // Reset rover mesh and physics body positions, rotations, and velocities
        if (roverMesh) {
            roverMesh.position.set(0, 1.5, 0);
            roverMesh.quaternion.set(0, 0, 0, 1);
        }
        if (car.chassisBody) {
            car.chassisBody.velocity.set(0, 0, 0);
            car.chassisBody.angularVelocity.set(0, 0, 0);
            car.chassisBody.force.set(0, 0, 0);
            car.chassisBody.torque.set(0, 0, 0);
            car.wheelForces = [0, 0, 0, 0];
            car.chassisBody.position.set(0, 1.5, 0);
            car.chassisBody.quaternion.set(0, 0, 0, 1);

        }
    
        // Ensure the input controls are reset
        input.forward = false;
        input.backward = false;
        input.left = false;
        input.right = false;
        input.brake = false;
    
        document.getElementById('congratulationsModal').style.display = 'none';
    
        console.clear(); // Clear the console 
    }
    
    
    // You can call this function to reset the game, e.g., by a button press
    document.getElementById('resetButton').addEventListener('click', resetGame);
    


    //Code relevant to the animation and physics
    function animate() {
        requestAnimationFrame(animate);

        stats.begin();
        physicsWorld.update(1 / 60); // Assuming 60fps
        const deltaTime = 1 / 60;
        physicsWorld.controlCar(input, car);

        if (roverMesh) {
            roverMesh.position.copy(car.chassisBody.position);
            roverMesh.quaternion.copy(car.chassisBody.quaternion);
            roverMesh.position.y -= 0.4;
            const adjustmentQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
            roverMesh.quaternion.multiply(adjustmentQuaternion);
            roverMesh.scale.set(5, 5, 5);
        }

        if (checkCollision(roverMesh, endZoneMesh)) {
            console.log('You win!');
        }

        if (roverMesh) {
            const backward = new THREE.Vector3(0, 0, 1).applyQuaternion(roverMesh.quaternion).negate();
            const offset = backward.multiplyScalar(25).add(new THREE.Vector3(0, 15, 0));
            sceneSetup.camera.position.copy(roverMesh.position).add(offset);
            sceneSetup.camera.lookAt(roverMesh.position);
        }





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
