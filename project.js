import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBB } from 'three/addons/math/OBB.js';

// Initial Setups
const scene = new THREE.Scene();

const viewportSize = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const canvas = document.querySelector('#webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(viewportSize.width, viewportSize.height);
renderer.shadowMap.enabled = true;
const aspectRatio = viewportSize.width / viewportSize.height;


// Lights

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, -4, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;

directionalLight.target = new THREE.Object3D();
scene.add(directionalLight.target);

scene.add(directionalLight);

// const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(helper);


// Objects

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
);

cube.castShadow = true;
cube.receiveShadow = true;
var cubeBoundingBox = new THREE.Box3()
cube.geometry.computeBoundingBox();


var textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./textures/ground/grass_block_top.png');

texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
texture.repeat = new THREE.Vector2(64, 64);

const material = new THREE.MeshStandardMaterial({ map: texture });


const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(64, 64),
    material
);

plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;
plane.receiveShadow = true;

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

const obstacleGeometry = new THREE.BoxGeometry();
const obstacleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
obstacle.position.set(6, 0, 0); // Set the position of the static cube
obstacle.geometry.computeBoundingBox();
var obstacleBoundingBox = new THREE.Box3()
scene.add(obstacle);


scene.add(cube);
// scene.add(plane);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);


//Camera

const camera = new THREE.PerspectiveCamera(
    75,
    aspectRatio,
);

scene.add(camera);
const cameraDistance = 5;
camera.position.y = 5;
camera.lookAt(cube.position);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});


// Event listener for keydown

const velocity = new THREE.Vector3(0, 0, 0);
const acceleration = new THREE.Vector3(0, 0, 10);
const maxSpeed = 0.2;


const keyboardState = {};

window.addEventListener('keydown', (event) => {
    keyboardState[event.key] = true;
});
window.addEventListener('keyup', (event) => {
    keyboardState[event.key] = false;
});


//Tick loop

const clock = new THREE.Clock();

const tick = () => {
    const delta = clock.getDelta();

    if (keyboardState['q']) {
        cube.rotation.y += 0.03;
    }
    if (keyboardState['d']) {
        cube.rotation.y -= 0.03;
    }

    if (keyboardState['z']) {
        velocity.x += (acceleration.z * Math.sin(cube.rotation.y)) * delta * !cubeBoundingBox.intersectsBox(obstacleBoundingBox);
        velocity.z += (acceleration.z * Math.cos(cube.rotation.y)) * delta * !cubeBoundingBox.intersectsBox(obstacleBoundingBox);

    }
    if (keyboardState['s']) {
        velocity.x -= (acceleration.z * Math.sin(cube.rotation.y)) * delta;
        velocity.z -= (acceleration.z * Math.cos(cube.rotation.y)) * delta;

    }
    const currentSpeed = velocity.length();
    if (currentSpeed < 0.001) {
        velocity.multiplyScalar(0);
    }

    // console.log(currentSpeed); 
    // console.log(velocity);
    if (currentSpeed > maxSpeed) {
        velocity.multiplyScalar(maxSpeed / (currentSpeed*2));
    }

    cube.position.add(velocity);
    velocity.multiplyScalar(0.95);

    obstacleBoundingBox.copy( obstacle.geometry.boundingBox ).applyMatrix4( obstacle.matrixWorld );
    cubeBoundingBox.copy( cube.geometry.boundingBox ).applyMatrix4( cube.matrixWorld );

    if (cubeBoundingBox.intersectsBox(obstacleBoundingBox)) {
        velocity.multiplyScalar(-1);
        console.log('collision');
    }

    if (cube.position.x > 32) {
        cube.position.x = -32;
    }

    if (cube.position.x < -32) {
        cube.position.x = 32;
    }

    if (cube.position.z > 32) {
        cube.position.z = -32;
    }

    if (cube.position.z < -32) {
        cube.position.z = 32;
    }


    const relativeCameraOffset = new THREE.Vector3(0, 2, -cameraDistance);
    const cameraOffset = relativeCameraOffset.applyMatrix4(cube.matrixWorld);
    camera.position.copy(cameraOffset);
    camera.lookAt(cube.position);

    directionalLight.position.x = cube.position.x;
    directionalLight.position.y = cube.position.y + 5;
    directionalLight.position.z = cube.position.z + 5;
    directionalLight.target.position.copy(cube.position);
    
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
};

tick();
