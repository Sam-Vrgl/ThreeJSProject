import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

let camera, scene, renderer, textMesh;

init();
animate();

function init() {
    // Base setup for the scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add light
    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(light);

    // Position the camera
    camera.position.z = 5;

    // Initialize text geometry and mesh
    const loader = new FontLoader();

    // Load a font
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const geometry = new THREE.TextGeometry('Hello!', {
            font: font,
            size: 1,
            height: 0.1,
            curveSegments: 12,
            bevelEnabled: false,
        });
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        textMesh = new THREE.Mesh(geometry, material);
        scene.add(textMesh);

        // Initially position the textMesh
        textMesh.position.x = -2;
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Update the scene based on the input
    document.getElementById('textInput').addEventListener('input', updateText);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateText(event) {
    const inputText = event.target.value;
    textMesh.geometry = new THREE.TextGeometry(inputText || ' ', {
        font: textMesh.geometry.parameters.font,
        size: 1,
        height: 0.1,
    });
}

animate();
