// src/components/PhysicsWorld.js
import * as CANNON from 'cannon-es';
import { threeToCannon, ShapeType } from 'three-to-cannon'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0); // Set gravity
        this.sphereBody = null;
    }

    addGround() {
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 }); // Mass 0 makes it static
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Align with the Three.js ground
        this.world.addBody(groundBody);
    }

    addMap() {
        return new Promise((resolve, reject) => {
            const gltfLoader = new GLTFLoader();
            gltfLoader.load('./public/objects/Tile1.glb', (gltf) => {
                const map = gltf.scene;
                map.scale.set(10, 10, 10);
                map.position.set(0, 6, 0);
            
                const shape = threeToCannon(map, {type: ShapeType.HULL});
                console.log('shape', shape);
                shape.offset = new CANNON.Vec3(0, 6, 0);
                
                if (!shape || !shape.offset) {
                    reject("Failed to convert the map to a physics shape or offset is undefined.");
                    return;
                }
            
                const mapBody = new CANNON.Body({
                    mass: 0,
                    shape: shape.shape,
                });
                if (shape.offset) mapBody.position.copy(shape.offset);
                this.world.addBody(mapBody);
            
                resolve({ threeObject: map, cannonBody: mapBody });
            }, undefined, reject);
            
        });
    }
    
    

    addSphere() {
        const sphereShape = new CANNON.Sphere(1); // Radius
        const sphereBody = new CANNON.Body({
            mass: 1, // Set the mass to something other than 0 to make it dynamic
            shape: sphereShape
        });
        sphereBody.position.set(0, 5, 0); // Position it similarly to the Three.js mesh
        this.world.addBody(sphereBody);
        this.sphereBody = sphereBody;
        return sphereBody;
    }

    applyForceToSphere(force) {
        if (this.sphereBody) {
            this.sphereBody.applyForce(force, this.sphereBody.position);
        }
    }

    addVehicle(){
        const carBody = new CANNON.Body({
            mass: 5,
            position: new CANNON.Vec3(0, 5, 0),
            shape: new CANNON.Box(new CANNON.Vec3(4, 0.5, 2))
        });


        const vehicle = new CANNON.RigidVehicle({
            chassisBody: carBody
        });

        const mass = 1;
        const axisWidth = 5;
        const wheelShape = new CANNON.Sphere(1);
        const wheelMaterial = new CANNON.Material('wheel');
        const down = new CANNON.Vec3(0, -1, 0);

        const wheelBody1 = new CANNON.Body({mass, material: wheelMaterial});
        wheelBody1.addShape(wheelShape);
        wheelBody1.angularDamping = 0.4;
        vehicle.addWheel({
            body: wheelBody1,
            position: new CANNON.Vec3(-2,0, axisWidth/2),
            axis: new CANNON.Vec3(0,0,1),
            direction: down,
        });

        const wheelBody2 = new CANNON.Body({mass, material: wheelMaterial});
        wheelBody2.addShape(wheelShape);
        wheelBody2.angularDamping = 0.4;
        vehicle.addWheel({
            body: wheelBody2,
            position: new CANNON.Vec3(-2,0, -axisWidth/2),
            axis: new CANNON.Vec3(0,0,1),
            direction: down,
        });

        const wheelBody3 = new CANNON.Body({mass, material: wheelMaterial});
        wheelBody3.addShape(wheelShape);
        wheelBody3.angularDamping = 0.4;
        vehicle.addWheel({
            body: wheelBody3,
            position: new CANNON.Vec3(2,0, axisWidth/2),
            axis: new CANNON.Vec3(0,0,1),
            direction: down,
        });
        const wheelBody4 = new CANNON.Body({mass, material: wheelMaterial});
        wheelBody4.addShape(wheelShape);
        wheelBody4.angularDamping = 0.4;
        vehicle.addWheel({
            body: wheelBody4,
            position: new CANNON.Vec3(2,0, -axisWidth/2),
            axis: new CANNON.Vec3(0,0,1),
            direction: down,
        });

        vehicle.addToWorld(this.world);
        return vehicle;
    }

    controlCar(input, vehicle){
        const maxSteerVal = Math.PI / 7;
        const maxForce = 20;

        
        if (input.forward) {
            vehicle.setWheelForce(maxForce, 2);
            vehicle.setWheelForce(maxForce, 3);
        }else if(!input.forward && !input.backward){
            vehicle.setWheelForce(0, 2);
            vehicle.setWheelForce(0, 3);
        }


        if (input.backward) {
            vehicle.setWheelForce(-maxForce/2, 2);
            vehicle.setWheelForce(-maxForce/2, 3);
        }else if(!input.backward && !input.forward){
            vehicle.setWheelForce(0, 2);
            vehicle.setWheelForce(0, 3);
        }
    
        if (input.left) {
            vehicle.setSteeringValue(maxSteerVal, 0);
            vehicle.setSteeringValue(maxSteerVal, 1);
            vehicle.setSteeringValue(-maxSteerVal, 2);
            vehicle.setSteeringValue(-maxSteerVal, 3);
        }

        if (input.right) {  
            vehicle.setSteeringValue(-maxSteerVal, 0);
            vehicle.setSteeringValue(-maxSteerVal, 1);
            vehicle.setSteeringValue(maxSteerVal, 2);
            vehicle.setSteeringValue(maxSteerVal, 3);
        }
        if (!input.right && !input.left) {
            vehicle.setSteeringValue(0, 0);
            vehicle.setSteeringValue(0, 1);
            vehicle.setSteeringValue(0, 2);
            vehicle.setSteeringValue(0, 3);
        }

        if (input.brake) {
            vehicle.setWheelForce(0, 2);
            vehicle.setWheelForce(0, 3);
        }
            
        
    }

    update = (deltaTime) => {
        this.world.step(deltaTime);
    }
}
