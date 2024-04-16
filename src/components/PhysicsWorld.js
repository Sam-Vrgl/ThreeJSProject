// src/components/PhysicsWorld.js
import * as CANNON from 'cannon-es';

export class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0); // Set gravity
        this.sphereBody = null;
    }

    //function to add the physical ground to the world
    addGround() {
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 }); // Mass 0 makes it static
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Align with the Three.js ground
        this.world.addBody(groundBody);
    }

    //function to add obstacle bodies to the world
    addObstacles(data) {
    let sphereShape, cylinderShape, sphereBody, cylinderBody;

    // Loop over spheres data and add spheres to the world
    for (let i = 0; i < data.spheres.length; i++) {
        sphereShape = new CANNON.Sphere(data.spheres[i].radius);
        sphereBody = new CANNON.Body({
            mass: 0,
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
            16
        );
        let correctedYPosition = data.pillars[i].position.y + data.pillars[i].height / 2;
        cylinderBody = new CANNON.Body({
            mass: 0, 
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


//function to add the rover vehicle to the world
addVehicle() {

    // Create the vehicle body
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

    // Add wheels
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


//Function to control the vehicle
controlCar(input, vehicle) {
    const maxSteerVal = Math.PI / 8;
    const maxForce = 20;

    //accelerate
    if (input.forward) {
        vehicle.setWheelForce(maxForce, 2);
        vehicle.setWheelForce(maxForce, 3);
    } else if (!input.forward && !input.backward) {
        vehicle.setWheelForce(0, 2);
        vehicle.setWheelForce(0, 3);
    }

    //reverse
    if (input.backward) {
        vehicle.setWheelForce(-maxForce / 1.2, 2);
        vehicle.setWheelForce(-maxForce / 1.2, 3);
    } else if (!input.backward && !input.forward) {
        vehicle.setWheelForce(0, 2);
        vehicle.setWheelForce(0, 3);
    }

    //steer
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
    //brake (not functional)
    if (input.brake) {
        vehicle.setWheelForce(0, 2);
        vehicle.setWheelForce(0, 3);
    }


}


update = (deltaTime) => {
    this.world.step(deltaTime);
}
}
