import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import anime from 'animejs';

const scene = new THREE.Scene();

const viewportSize = {
    width: window.innerWidth,
    height: window.innerHeight,
};
const aspectRatio = viewportSize.width / viewportSize.height;

const camera = new THREE.PerspectiveCamera(
    75,
    viewportSize.width / viewportSize.height
);



// const camera = new THREE.OrthographicCamera(
//     -2 * aspectRatio,
//     2 * aspectRatio,
//     2,
//     -2,
// );




const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const textureLoader = new THREE.TextureLoader();

const texture = textureLoader.load('./textures/metalPanel/Sci_fi_Metal_Panel_004_basecolor.jpg');
const aoTexture = textureLoader.load('./textures/metalPanel/Sci_fi_Metal_Panel_004_ambientOcclusion.jpg');
const normalTexture = textureLoader.load('./textures/metalPanel/Sci_fi_Metal_Panel_004_normal.jpg');
const roughnessTexture = textureLoader.load('./textures/metalPanel/Sci_fi_Metal_Panel_004_roughness.jpg');
const emissiveTexture = textureLoader.load('./textures/metalPanel/Sci_fi_Metal_Panel_004_emissive.jpg');
const heightTexture = textureLoader.load('./textures/metalPanel/Sci_fi_Metal_Panel_004_height.png');
const metalTexture = textureLoader.load('./textures/metalPanel/Sci_fi_Metal_Panel_004_metallic.jpg');

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.6, 0.6, 64, 64, 64),
    new THREE.MeshStandardMaterial({
        map: texture,
        aoMap: aoTexture,
        normalMap: normalTexture,
        roughnessMap: roughnessTexture,
        emissiveMap: emissiveTexture,
        emissiveIntensity: 1.5,
        emissive: 0xffffff,
        displacementMap: heightTexture,
        displacementScale: 0.05,
        metalnessMap: metalTexture,
        metalness: 0.5,
        roughness: 0.5
    })
);
scene.add(cube);


scene.add(camera);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
camera.lookAt(new THREE.Vector3());

const canvas = document.querySelector('#webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
console.log(window.devicePixelRatio);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(viewportSize.width, viewportSize.height);

// const material = new THREE.MeshBasicMaterial()

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x00cec9 })
);
sphere.position.x = -1;

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    new THREE.MeshBasicMaterial({ color: 0x6c5ce7 })
);
torus.position.x = 1;

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    new THREE.MeshBasicMaterial({ color: 0xffeaa7 })
);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;

scene.add(sphere, torus, plane);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// let gltf;

// const loader = new GLTFLoader();

// loader.load( 'objects/scene.gltf', function ( gltf ) {
//     gltf.scene.scale.set(0.1, 0.1, 0.1);
//     scene.add( gltf.scene );
//     console.log(gltf);
//     controls.target = gltf.scene.position;

// }, undefined, function ( error ) {

// 	console.error( error );

// } );

// function someFunctionUsingGltf() {
//     if (gltf) {
//         // Do something with gltf
//         console.log(gltf);
//     } else {
//         console.log("GLTF not yet loaded.");
//     }
// };




const cursor = {
    x: 0,
    y: 0
};

window.addEventListener('mousemove', (event) => {
    cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
    cursor.y = -(event.clientY / window.innerHeight) * 2 + 1;
});


const clock = new THREE.Clock();
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
// controls.target = new THREE.Vector3();

const tick = () => {
    const delta = clock.getDelta();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
    controls.update();
}

tick();

// anime({
//     targets: sphere.scale,
//     x: [1, 2],
//     y: [1, 2],
//     z: [1, 2],
//     duration: 1000,
//     easing: 'easeInOutQuad',
//     loop: true,
//     direction: 'alternate'
// });