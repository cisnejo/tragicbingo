import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import * as THREE from "three";

// CANNON and Three worlds -----------------------------------
const renderer = new THREE.WebGLRenderer();
const physicsWorld = new CANNON.World({
  gravity: new CANNON.Vec3(0, 0, -9.82),
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// camera ---------------------------
const camera = new THREE.PerspectiveCamera(
  100,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 0);
camera.lookAt(0, 0, 0);
// CANNON stuff ------------------------------------------
const axesHelper = new THREE.AxesHelper(8);
const cannonDebugger = new (CannonDebugger as any)(scene, physicsWorld, {});

const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane(),
});

let number = 5;
let boxHeight = 0.01;
for (let i = 1; i <= number; i++) {
  let row = i - Math.ceil(number / 2);
  for (let j = 1; j <= number; j++) {
    let col = j - Math.ceil(number / 2);
    CreatePhysicsBox(0.5, 0.5, boxHeight, row, col, 0);
  }
}

let balls = 5;
for (let i = 1; i <= balls; i++) {
  const negativeOrNot = Math.random() * 2 > 1 ? 1 : -1;
  const x = Math.random() / 5;
  const y = Math.random() / 5;
  console.log(x);
  console.log(negativeOrNot);
  addSphereBody(i * x * negativeOrNot, i * y * negativeOrNot, i);
}

// rules --------------------
camera.position.z = 6;
groundBody.quaternion.setFromEuler(0, 0, 0);

//physicsWorld.addBody(groundBody);

//scene.add(axesHelper);
animate();

// functions ---------------------------------------

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  cannonDebugger.update();
  physicsWorld.fixedStep();
}

console.log(physicsWorld);
function CreatePhysicsBox(
  w: number,
  h: number,
  l: number,
  x: number,
  y: number,
  z: number
) {
  /*  l (length) must be not 0 in order to interact with world*/
  const boxBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Box(new CANNON.Vec3(w, h, l)),
  });

  boxBody.position.set(x, y, z);
  physicsWorld.addBody(boxBody);
}

function addSphereBody(x: number, y: number, z: number) {
  const sphereBody = new CANNON.Body({
    mass: 0.1,
    shape: new CANNON.Sphere(0.2),
  });
  sphereBody.position.set(x, y, z);
  physicsWorld.addBody(sphereBody);
}
