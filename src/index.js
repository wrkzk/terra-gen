import './style.css'
import * as THREE from 'three'
import SimplexNoise from 'simplex-noise';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

var scene, camera, canvas, renderer, controls, simplex, gui;
var material, mesh;

var terrain_properties = new function() {
    this.frequency = 0.04;
    this.width = 50;
    this.height = 50;
}

function map(val, min1, max1, min2, max2) {
    const t = (val - min1) / (max1 - min1);
    return (max2 - min2) * t + min2;
}

function noise(x, y) {
    return map(simplex.noise2D(x, y), -1, 1, 0, 1);
}

function octave(x, y, octaves) {
    let val = 0;
    let freq = terrain_properties.frequency;
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

function render_terrain() {
    var geometry = new THREE.PlaneGeometry(terrain_properties.width, terrain_properties.height, terrain_properties.width - 1, terrain_properties.height - 1);
    apply_noise(geometry);
    
    material = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true});
    mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2
    
    scene.add(mesh);
}

function update_terrain() {
    var newGeo = new THREE.PlaneGeometry(terrain_properties.width, terrain_properties.height, terrain_properties.width - 1, terrain_properties.height - 1);
    apply_noise(newGeo);

    mesh.geometry.dispose();
    mesh.geometry = newGeo;
}

function apply_noise(geo) {
    let positions = geo.attributes.position.array;

    for (let i = 0; i < terrain_properties.width; i++) {
        for (let j = 0; j < terrain_properties.height; j++) {
            let gen = map(octave(j, i, 1), 0, 1, -10, 10);
            let elevation;

            if (gen < 0) elevation = gen
            else elevation = 0

            positions[(i * terrain_properties.width + j) * 3 + 2] = elevation;
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
    gui = new dat.GUI();

    // Create the gui
    gui.add(terrain_properties, 'frequency', 0, 1).onChange(update_terrain);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf3f2e5);

    controls.enableDamping = false;
    controls.enablePan = false;

    document.body.appendChild(renderer.domElement);

    camera.position.set(0, 45, 60);
    camera.lookAt(0, 0, 0);
    controls.update();
}

function animate() {
	requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

init();
render_terrain();
animate();