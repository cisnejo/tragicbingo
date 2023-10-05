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
const raycaster = new THREE.Raycaster();
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

const cannonDebugger = new (CannonDebugger as any)(scene, physicsWorld, {});

type SphereTypes = {
  sphereMesh: THREE.Mesh<THREE.SphereGeometry>;
  sphereBody: CANNON.Body;
};
class ElementList {
  boxList: CANNON.Body[];
  sphereList: SphereTypes[];
  static sphereList: any;
  constructor() {
    this.boxList = [];
    this.sphereList = [];
  }
}

const elementList = new ElementList();

let number = 5;
let boxHeight = 0.15;

for (let i = 1; i <= number; i++) {
  let row = i - Math.ceil(number / 2);
  for (let j = 1; j <= number; j++) {
    let col = j - Math.ceil(number / 2);
    CreatePhysicsBox(0.5, 0.5, 0.01, row, col, -0.01);
  }
}
for (let i = 0; i <= number; i++) {
  let row = i - Math.ceil(number / 2);
  CreatePhysicsBox(0.5 * number, 0.01, boxHeight, 0, row + 0.5, 0);
  CreatePhysicsBox(0.01, 0.5 * number, boxHeight, row + 0.5, 0, 0);
}

let balls = 5;
for (let i = 1; i <= balls; i++) {
  const negativeOrNot = Math.random() * 2 > 1 ? 1 : -1;
  const x = Math.random() / 5;
  const y = Math.random() / 5;
  addSphereBody(i * x * negativeOrNot, i * y * negativeOrNot, 1);
}

// rules --------------------
camera.position.z = 6;

//physicsWorld.addBody(groundBody);

//scene.add(axesHelper);

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
  elementList.boxList.push(boxBody);
}

function addSphereBody(x: number, y: number, z: number) {
  const geometry = new THREE.SphereGeometry(0.2);
  const material = new THREE.MeshNormalMaterial();
  const sphereMesh = new THREE.Mesh(geometry, material);

  const sphereBody = new CANNON.Body({
    mass: 3,
    shape: new CANNON.Sphere(0.2),
  });

  scene.add(sphereMesh);
  sphereBody.position.set(x, y, z);
  physicsWorld.addBody(sphereBody);
  elementList.sphereList.push({ sphereBody, sphereMesh });
}

function CheckSphereInSquare(sphere: CANNON.Body) {}

elementList.sphereList.forEach((sphere: SphereTypes) => {
  sphere.sphereBody.velocity;
});

let mouse = new THREE.Vector2();

function onClick(e: any) {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const obj = intersects[0];

    const { object, face } = obj;
    if (object.geometry.type === "SphereGeometry") {
      const elemntobject = elementList.sphereList.find(
        (sphere: SphereTypes) => {
          return sphere.sphereMesh.uuid === object.uuid;
        }
      )!;
      if (elemntobject === undefined) {
        console.log(elementList.sphereList, object.uuid);
      }
      else{
        console.log(elemntobject.sphereMesh.uuid)
      }
      const currentSphere = elemntobject.sphereMesh;
      holdState.isDown = true;
      holdState.currentObject = elemntobject.sphereBody;
      window.addEventListener("mousemove", movesphere);
      window.addEventListener("mouseup", removeListeners);

      function removeListeners() {
        holdState.currentObject.mass = 3;
        holdState.currentObject = "";
        holdState.isDown = false;
        window.removeEventListener("mousemove", movesphere);
        window.removeEventListener("mouseup", removeListeners);
      }

      function movesphere() {
        elemntobject?.sphereBody.position.set(mouse.x * 6.5, mouse.y * 4.75, 2);
      }
    }

    // Get the impulse based on the face normal
  }
}

document.addEventListener("mousedown", (e) => onClick(e));

window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

class HoldState {
  currentObject: any;
  isDown: boolean | undefined;
  constructor() {
    this.currentObject = "";
    this.isDown = false;
  }
}
const holdState = new HoldState();

animate();

// functions ---------------------------------------

function animate() {
  physicsWorld.fixedStep();
 // cannonDebugger.update();
  elementList.sphereList.forEach((sphere: SphereTypes) => {
    sphere.sphereMesh.position.copy(sphere.sphereBody.position);
    sphere.sphereMesh.quaternion.copy(sphere.sphereBody.quaternion);
  });
  if (holdState.isDown && holdState.currentObject) {
    holdState.currentObject.mass = 0;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
