import './style.css'
import * as THREE from 'three'
import SimplexNoise from 'simplex-noise';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

var scene, camera, canvas, renderer, controls, simplex;
var geometry, material, mesh;

init();
draw_terrain();
animate();

function map(val, min1, max1, min2, max2) {
    const t = (val - min1) / (max1 - min1);
    return (max2 - min2) * t + min2;
}

function noise(x, y) {
    return map(simplex.noise2D(x, y), -1, 1, 0, 1);
}

function octave(x, y, octaves) {
    let val = 0;
    let freq = 0.04;
    let max = 0;
    let amp = 1;
    for (let i=0; i < octaves; i++) {
        val += noise(x * freq, y * freq) * amp;
        max += amp;
        amp /= 2;
        freq *= 2;
    }
    return val/max;
}

function draw_terrain() {
    const width = 50;
    const height = 50;

    geometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1);
    material = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true});
    mesh = new THREE.Mesh(geometry, material);

    const positions = mesh.geometry.attributes.position.array;

    mesh.rotation.x = Math.PI / 2
    scene.add(mesh);

    // Draw terrain here
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let elevation = map(octave(j, i, 1), 0, 1, -10, 10);
            if (elevation < 0) positions[(i * width + j) * 3 + 2] = elevation;
        }
    }
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    canvas = document.querySelector("#c");
    renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    controls = new OrbitControls(camera, renderer.domElement);
    simplex = new SimplexNoise();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf3f2e5);

    controls.enableDamping = false;
    controls.enablePan = false;

    document.body.appendChild(renderer.domElement);

    camera.position.set(0, 45, 60);
    camera.lookAt(0, 0, 0);
    controls.update()
}

function animate() {
	requestAnimationFrame(animate);
    renderer.render(scene, camera);
};