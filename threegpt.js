import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const light = new THREE.AmbientLight(0xffffff, 2);
scene.add(light);

// add orbit controls
const controls = new OrbitControls(camera, document.body);

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add any additional code for your scene setup here
let gltfObject = null;
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./libs/draco/');
const loader = new GLTFLoader();
let mixer = null;
loader.setDRACOLoader(dracoLoader);

loader.load('./duck-gltf/Duck.gltf',  (gltf) => {
    console.log(gltf);
    gltfObject = gltf.scene;
});

// raycaster 
const raycaster = new THREE.Raycaster();
const rayOrigin = new THREE.Vector3(-2, 1, 0);
const rayTarget = new THREE.Vector3(3, 0, 0);

if (gltfObject !== null){
    scene.add(gltfObject.children[0]);
}

const clock = new THREE.Clock();
// Render the scene
function tick() {
    const delta = clock.getDelta();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
    controls.update();

    if (mixer !== null){
        mixer.update(delta);
    }
}
tick();