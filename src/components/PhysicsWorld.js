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

    addTestObject() {
        return new Promise((resolve, reject) => {
            const gltfLoader = new GLTFLoader();
            gltfLoader.load('./public/objects/Tile2.glb', (gltf) => {
                const allPromises = [];

                // Dimensions for a 10x10 grid
                const rows = 10;
                const cols = 10;
                const spacing = 10; // Spacing of 10 units between tiles

                // Iterate over the grid to place tiles
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        const scene = gltf.scene.clone(); // Clone the scene for each tile
                        const compoundBody = new CANNON.Body({ mass: 0 });

                        scene.traverse((child) => {
                            if (child.isMesh) {
                                const shape = threeToCannon(child, { type: ShapeType.HULL });
                                if (!shape) {
                                    console.error("Failed to convert a child mesh to a physics shape.");
                                    return;
                                }

                                const offset = child.position;
                                const orientation = child.quaternion;
                                compoundBody.addShape(shape.shape, new CANNON.Vec3(offset.x, offset.y, offset.z), new CANNON.Quaternion(orientation.x, orientation.y, orientation.z, orientation.w));
                            }
                        });

                        // Set position for this tile based on grid coordinates, spacing the tiles 10 units apart
                        const posX = (i - rows / 2) * spacing + spacing / 2;
                        const posZ = (j - cols / 2) * spacing + spacing / 2;
                        compoundBody.position.set(posX, 0, posZ);

                        this.world.addBody(compoundBody);

                        // Create an object to keep track of the Three.js and Cannon.js objects for this tile
                        const tile = { threeObject: scene, cannonBody: compoundBody };
                        allPromises.push(Promise.resolve(tile));
                    }
                }

                // Resolve with all the tiles once they're all added
                Promise.all(allPromises).then(resolve).catch(reject);
            }, undefined, (error) => reject(error));
        });
    }



    addMap() {
        return new Promise((resolve, reject) => {
            const gltfLoader = new GLTFLoader();
            gltfLoader.load('./public/objects/Tile1.glb', (gltf) => {
                const map = gltf.scene;
                map.children[0].scale.set(5, 5, 5);
                map.position.set(0, 6, 0);

                const shape = threeToCannon(map.children[0], { type: ShapeType.HULL });
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

                let direction = 0; // 0: right, 1: up, 2: left, 3: down
                let steps = 1; // Initial steps in the current direction
                let stepCounter = 0; // Current step count in the current direction
                let directionChange = 0; // Counts the number of times the direction has changed
                let x = 0, z = 0; // Initial position
                let dx = [1, 0, -1, 0]; // Direction changes for x
                let dz = [0, 1, 0, -1]; // Direction changes for z
                let totalTiles = 30; // Total number of tiles to place

                for (let i = 0; i < totalTiles; i++) {
                    // Add the shape at the current position
                    mapBody.addShape(shape.shape, new CANNON.Vec3(x * 10, 0, z * 10));

                    // Move to the next position
                    x += dx[direction];
                    z += dz[direction];
                    stepCounter++;

                    // Check if we need to change direction
                    if (stepCounter == steps) {
                        direction = (direction + 1) % 4; // Cycle through the directions
                        stepCounter = 0; // Reset step counter for the new direction
                        directionChange++; // Increment the number of direction changes

                        // Every full cycle (right->down->left->up), increase the steps
                        if (directionChange % 2 == 0) {
                            steps++;
                        }
                    }
                }


                if (shape.offset) mapBody.position.copy(shape.offset);
                this.world.addBody(mapBody);

                resolve({ threeObject: map, cannonBody: mapBody });
            }, undefined, reject);

        });
    }



    addObstacles(data) {
    let sphereShape, cylinderShape, sphereBody, cylinderBody;

    // Loop over spheres data and add spheres to the world
    for (let i = 0; i < data.spheres.length; i++) {
        sphereShape = new CANNON.Sphere(data.spheres[i].radius);
        sphereBody = new CANNON.Body({
            mass: 0, // Assuming a mass of 1 for all spheres, you can change it as needed
            position: new CANNON.Vec3(
                data.spheres[i].position.x,
                data.spheres[i].position.y,
                data.spheres[i].position.z
            ),
            shape: sphereShape
        });
        this.world.addBody(sphereBody);
    }

    // Loop over pillars data and add cylinders to the world
    for (let i = 0; i < data.pillars.length; i++) {
        cylinderShape = new CANNON.Cylinder(
            data.pillars[i].radius,
            data.pillars[i].radius,
            data.pillars[i].height,
            16 // number of segments, assuming a default value, you can change it as needed
        );
        let correctedYPosition = data.pillars[i].position.y + data.pillars[i].height / 2;
        cylinderBody = new CANNON.Body({
            mass: 0, // Assuming a mass of 1 for all cylinders, you can change it as needed
            position: new CANNON.Vec3(
                data.pillars[i].position.x,
                correctedYPosition,
                data.pillars[i].position.z
            ),
            shape: cylinderShape

        });
        this.world.addBody(cylinderBody);
    }
}


// applyForceToSphere(force) {
//     if (this.sphereBody) {
//         this.sphereBody.applyForce(force, this.sphereBody.position);
//     }
// }

addVehicle() {
    const carBody = new CANNON.Body({
        mass: 5,
        position: new CANNON.Vec3(0, 5, 0),
        shape: new CANNON.Box(new CANNON.Vec3(2, 0.8, 2))
    });


    const vehicle = new CANNON.RigidVehicle({
        chassisBody: carBody
    });

    const mass = 1;
    const axisWidth = 5;
    const wheelShape = new CANNON.Sphere(1);
    const wheelMaterial = new CANNON.Material('wheel');
    const down = new CANNON.Vec3(0, -1, 0);

    const wheelBody1 = new CANNON.Body({ mass, material: wheelMaterial });
    wheelBody1.addShape(wheelShape);
    wheelBody1.angularDamping = 0.4;
    vehicle.addWheel({
        body: wheelBody1,
        position: new CANNON.Vec3(-2, -1, axisWidth / 2),
        axis: new CANNON.Vec3(0, 0, 1),
        direction: down,
    });

    const wheelBody2 = new CANNON.Body({ mass, material: wheelMaterial });
    wheelBody2.addShape(wheelShape);
    wheelBody2.angularDamping = 0.4;
    vehicle.addWheel({
        body: wheelBody2,
        position: new CANNON.Vec3(-2, -1, -axisWidth / 2),
        axis: new CANNON.Vec3(0, 0, 1),
        direction: down,
    });

    const wheelBody3 = new CANNON.Body({ mass, material: wheelMaterial });
    wheelBody3.addShape(wheelShape);
    wheelBody3.angularDamping = 0.4;
    vehicle.addWheel({
        body: wheelBody3,
        position: new CANNON.Vec3(2, -1, axisWidth / 2),
        axis: new CANNON.Vec3(0, 0, 1),
        direction: down,
    });
    const wheelBody4 = new CANNON.Body({ mass, material: wheelMaterial });
    wheelBody4.addShape(wheelShape);
    wheelBody4.angularDamping = 0.4;
    vehicle.addWheel({
        body: wheelBody4,
        position: new CANNON.Vec3(2, -1, -axisWidth / 2),
        axis: new CANNON.Vec3(0, 0, 1),
        direction: down,
    });

    vehicle.addToWorld(this.world);
    return vehicle;
}

addEndZone() {
    //randomly placed, at least 30 units away from the origin
    const position = new CANNON.Vec3(
        Math.floor(Math.random() * (100 - 50 + 1)) + 50,
        0,
        Math.floor(Math.random() * (100 - 50 + 1)) + 50
    );


    console.log('end zone position', position);
    const size = new CANNON.Vec3(10, 50, 10);
    const zoneShape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
    const zoneBody = new CANNON.Body({
        mass: 0, // static body
        position: new CANNON.Vec3(position.x, position.y, position.z)
    });
    zoneBody.addShape(zoneShape);
    zoneBody.isEndZone = true; // Custom property to identify the end zone
    this.world.addBody(zoneBody);

    return position;    
}

controlCar(input, vehicle) {
    const maxSteerVal = Math.PI / 8;
    const maxForce = 20;


    if (input.forward) {
        vehicle.setWheelForce(maxForce, 2);
        vehicle.setWheelForce(maxForce, 3);
    } else if (!input.forward && !input.backward) {
        vehicle.setWheelForce(0, 2);
        vehicle.setWheelForce(0, 3);
    }


    if (input.backward) {
        vehicle.setWheelForce(-maxForce / 1.2, 2);
        vehicle.setWheelForce(-maxForce / 1.2, 3);
    } else if (!input.backward && !input.forward) {
        vehicle.setWheelForce(0, 2);
        vehicle.setWheelForce(0, 3);
    }

    if (input.left) {
        vehicle.setSteeringValue(maxSteerVal, 0);
        vehicle.setSteeringValue(maxSteerVal, 1);
        // vehicle.setSteeringValue(-maxSteerVal, 2);
        // vehicle.setSteeringValue(-maxSteerVal, 3);
    }

    if (input.right) {
        vehicle.setSteeringValue(-maxSteerVal, 0);
        vehicle.setSteeringValue(-maxSteerVal, 1);
        // vehicle.setSteeringValue(maxSteerVal, 2);
        // vehicle.setSteeringValue(maxSteerVal, 3);
    }
    if (!input.right && !input.left) {
        vehicle.setSteeringValue(0, 0);
        vehicle.setSteeringValue(0, 1);
        // vehicle.setSteeringValue(0, 2);
        // vehicle.setSteeringValue(0, 3);
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
