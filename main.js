import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger';
import gsap from "gsap";
import Stats from 'three/examples/jsm/libs/stats.module';
import sky from "./Assets/Background/sky.hdr";
import garden from "./Assets/Book/scene.glb";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

let player, city, dragonModel, dragonBody, mixer

const gltfLoader = new GLTFLoader();


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setPixelRatio(window.devicePixelRatio);

const stats = new Stats();
stats.showPanel(1); // 0: FPS, 1: ms (rendering time), 2: MB, 3+: custom
document.body.appendChild(stats.dom);
//Setting Controls
// const controls = new OrbitControls(camera, renderer.domElement)
// controls.enableDamping = true
// controls.dampingFactor = 0.1

const controls = new FirstPersonControls(camera, renderer.domElement);
controls.movementSpeed = 8;
controls.lookSpeed = 0.08;

//Setting Light 
const ambientLight = new THREE.AmbientLight(0xffffff, 5)
scene.add(ambientLight)

const light2 = new THREE.PointLight(0xffffff, .5)
light2.position.set(0, 1000, 0)
scene.add(light2)

const light = new THREE.PointLight(0xffffff, .5)
light.position.set(0, 2, 0)
scene.add(light)

const dragonPointLight = new THREE.PointLight(0xffffff, 1, 0.1);
scene.add(dragonPointLight);

// const pointLightHelper = new THREE.PointLightHelper(dragonPointLight, 0.2); // Second parameter is the size of the helper
// scene.add(pointLightHelper);

// Function to update point light position based on dragon model
function updatePointLightPosition() {
  if (dragonModel) {
    // If the dragon model exists in the scene
    dragonPointLight.position.copy(dragonModel.position); // Update point light position to match the dragon model's position
  }
}

//Helper
let axisHelper = new THREE.AxesHelper();
// scene.add(axisHelper);

//Adding Physics
let world = new CANNON.World();
world.gravity.set(0, -10, 0); // Gravity pulls things down
world.broadphase = new CANNON.NaiveBroadphase();
let cannonDebugger = new CannonDebugger(scene, world);

// Function to add physics to a mesh
function addPhysicsToMesh(mesh, shape, mass) {
  const body = new CANNON.Body({
    mass: mass, // Set mass
    shape: shape, // Set shape
  });
  body.position.copy(mesh.position);
  // body.quaternion.copy(mesh.quaternion);
  world.addBody(body);
  return body;
}

function syncMeshWithBody(mesh, body) {
  // console.log("sync with mesh")
  if (mesh !== undefined && mesh !== undefined) {
    // console.log(body.position)
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  }
  // console.log(body.position)
}

//Adding Models
const init = () => {

  const textureLoader = new RGBELoader();
  textureLoader.load(sky, (texture) => {
    // Set the texture minification filter
    // texture.minFilter = THREE.NearestFilter;
    // // Set the texture magnification filter
    // texture.magFilter = THREE.NearestFilter;
    // Set the texture wrapping mode
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set(4, 2);
    // Create the material using the texture
    const material = new THREE.MeshBasicMaterial({ map: texture });
    // Create the geometry for the background sphere
    const geometry = new THREE.SphereGeometry(100, 100, 50);
    // Create the background mesh
    const background = new THREE.Mesh(geometry, material);
    // Ensure the material is visible from the inside
    background.material.side = THREE.BackSide;
    // Add the background mesh to the scene
    scene.add(background);
  });


  function addPlaygroundModel() {
    gltfLoader.load(garden, (gltf) => {
      const model = gltf.scene;
      const cannonModel = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(1.5, 0.1, 3)),
      });
      cannonModel.position.set(0, 0, 0);
      model.position.copy(cannonModel.position);
      model.quaternion.copy(cannonModel.quaternion);
      world.addBody(cannonModel);
      scene.add(model);

      mixer = new THREE.AnimationMixer(gltf.scene);
      // Assuming there's an animation named "YourAnimationName" within the model
      const animationAction = mixer.clipAction(gltf.animations.find((anim) => anim.name === 'The Life'));
      animationAction.play();

      // Call function to load dragon model after the playground model is added
      // addDragonModel();
    });
  }
  let position = 1;

  window.addEventListener("mouseup", () => {
    switch (position) {
      case 1:
        cameraPosition(-10.701407342823469, 10.548126677131549, -5.093550002321239);
        cameraRotaion(0.3, -3, 0);
        position++
        break;
      case 2:
        cameraPosition(34.088817393686014, 2.440012064815781, -4.166806831962433);
        cameraRotaion(0.1, 2, 0);
        position++
        break;
      case 3:
        cameraPosition(29.535408511751136, 6.285267200335033, 32.68673162134645);
        cameraRotaion(-0.3, 0, 0);
        position++
        break;
      case 4:
        cameraPosition(-2.865241619197529, 17.706057196122796, 60);
        cameraRotaion(-0.5, 0, 0);
        position++
        break;
      case 5:
        cameraPosition(-11.78271038429085, 39.843310926040495, -15.713714575810757);
        cameraRotaion(-1.5, 0.2, 1.8);
        position = 1
        break;
      default:
        position = 1
        break;
    }
  });


  function cameraPosition(px, py, pz) {
    gsap.to(camera.position, {
      x: px,
      y: py,
      z: pz,
      duration: 2
    })
  }

  function cameraRotaion(rx, ry, rz) {
    gsap.to(camera.rotation, {
      x: rx,
      y: ry,
      z: rz,
      duration: 2.2
    })
  }

  // Function to add dragon model
  function addDragonModel() {
    gltfLoader.load('Assets/Player/male char.glb', (gltf) => {
      dragonModel = gltf.scene;
      dragonModel.scale.set(0.1, 0.1, 0.1);
      dragonModel.traverse(function (child) {
        if (child.isMesh) {
          // Adjust collision shape size
          const boundingBox = new THREE.Box3().setFromObject(child);
          const size = boundingBox.getSize(new THREE.Vector3());
          const shape = new CANNON.Box(new CANNON.Vec3(size.x / 110, size.y / 110, size.z / 110));
          dragonBody = addPhysicsToMesh(child, shape, 1);
          dragonBody.position.set(0, 1, 0);
        }
      });
      scene.add(dragonModel);
    });
  }

  // Call function to add playground model at the start
  addPlaygroundModel();
  window.addEventListener('keydown', onKeyDown);
}

function onKeyDown(event) {
  const keyCode = event.keyCode;
  const moveDistance = 0.1;

  switch (keyCode) {
    case 37: // Left arrow key
      dragonBody.position.x -= moveDistance;
      break;
    case 38: // Up arrow key
      dragonBody.position.z -= moveDistance;
      break;
    case 39: // Right arrow key
      dragonBody.position.x += moveDistance;
      break;
    case 40: // Down arrow key
      dragonBody.position.z += moveDistance;
      break;
  }
}

function updateCamera() {
  if (dragonModel) {
    const box = new THREE.Box3().setFromObject(dragonModel);
    const center = box.getCenter(new THREE.Vector3());

    camera.position.lerp(center.clone().add(new THREE.Vector3(0, 1, 0.5)), 0.05);
    camera.lookAt(center);
  }
}

const clock = new THREE.Clock();

init()
function animate() {
  requestAnimationFrame(animate);
  // console.log(clock.getDelta())
  controls.update(clock.getDelta());

  world.step(1 / 100); // Update at a fixed time interval
  // console.log("Number of Triangles :", renderer.info.render.triangles); // to Check how many triangles are there in scene
  // Update all models' positions and rotations according to their physics bodies
  syncMeshWithBody(dragonModel, dragonBody);
  updatePointLightPosition();
  // updateCamera()
  // cannonDebugger.update();
  renderer.render(scene, camera);

  stats.update();
}

animate();

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});