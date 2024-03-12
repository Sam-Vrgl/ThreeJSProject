import * as THREE from 'three';

// Basic scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

// Create a simple rocket
const geometry = new THREE.ConeGeometry(0.5, 2, 32);
const material = new THREE.MeshBasicMaterial({color: 0xffff00});
const rocket = new THREE.Mesh(geometry, material);
scene.add(rocket);

// Physics variables
let velocity = new THREE.Vector3(0, 0, 0);
let acceleration = new THREE.Vector3(0, 0.01, 0);

// Key controls
let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowUp':
            upPressed = true;
            break;
        case 'ArrowDown':
            downPressed = true;
            break;
        case 'ArrowLeft':
            leftPressed = true;
            break;
        case 'ArrowRight':
            rightPressed = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch(event.key) {
        case 'ArrowUp':
            upPressed = false;
            break;
        case 'ArrowDown':
            downPressed = false;
            break;
        case 'ArrowLeft':
            leftPressed = false;
            break;
        case 'ArrowRight':
            rightPressed = false;
            break;
    }
});

function updatePhysics() {
    if (upPressed) {
        velocity.add(acceleration);
    }
    if (downPressed) {
        velocity.sub(acceleration);
    }

    rocket.position.add(velocity);

    if (leftPressed) {
        rocket.rotation.z += 0.1;
    }
    if (rightPressed) {
        rocket.rotation.z -= 0.1;
    }

    // Reset acceleration to avoid constant acceleration when not pressing keys
    acceleration.set(0, 0.01, 0);

    // Apply rotation to velocity
    velocity.applyAxisAngle(new THREE.Vector3(0, 0, 1), rocket.rotation.z);
}

function createStarField() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0x888888 });
    const starVertices = [];

    for (let i = 0; i < 10000; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000); // Spread in x
        const y = THREE.MathUtils.randFloatSpread(2000); // Spread in y
        const z = THREE.MathUtils.randFloatSpread(2000); // Spread in z
        starVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);

    scene.add(stars);
}

createStarField();

function updateCameraPosition() {
    // Update the camera's position to follow the rocket
    // This example maintains the camera's position slightly behind and above the rocket
    camera.position.x = rocket.position.x;
    camera.position.y = rocket.position.y + 5;
    camera.position.z = rocket.position.z + 10;

    // Make the camera look at the rocket
    camera.lookAt(rocket.position);
}

// Update the animate function
function animate() {
    requestAnimationFrame(animate);

    updatePhysics();
    updateCameraPosition(); // Make sure the camera follows the rocket

    renderer.render(scene, camera);
}

animate();