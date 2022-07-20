import './style.css'
import * as THREE from 'three'
import SimplexNoise from 'simplex-noise';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

var scene, camera, canvas, renderer, controls, gui, mesh;
var generators;

var terrain_properties = new function() {
    this.frequency = 0.04;
    this.amplitude = 2;

    this.width = 150;
    this.height = 150;
}

function map(val, min1, max1, min2, max2) {
    const t = (val - min1) / (max1 - min1);
    return (max2 - min2) * t + min2;
}

function noise(x, y, iter) {
    return generators[iter].noise2D(x, y);
}

function compound_noise(x, y, octaves) {
    let val = 0;
    let freq = 0.01;
    let amp = 1;
    let sum = 0;

    for (let i=0; i < octaves; i++) {
        val += noise(x * freq, y * freq, i) * amp;
        sum += amp;

        amp /= 2;
        freq *= 2;
    }
    return val/sum;
}

function init_terrain() {
    let geometry = new THREE.PlaneGeometry(terrain_properties.width, terrain_properties.height, terrain_properties.width - 1, terrain_properties.height - 1);
    let material = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true});

    mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2
    
    apply_noise(geometry);
    scene.add(mesh);
}

function update_geometry() {
    var geometry = new THREE.PlaneGeometry(terrain_properties.width, terrain_properties.height, terrain_properties.width - 1, terrain_properties.height - 1);
    apply_noise(geometry);

    mesh.geometry.dispose();
    mesh.geometry = geometry;
}

function apply_noise(geo) {
    let positions = geo.attributes.position.array;

    for (let i = 0; i < terrain_properties.width; i++) {
        for (let j = 0; j < terrain_properties.height; j++) {
            //let gen = map(octave(j, i, 1), 0, 1, -10, 10) * terrain_properties.amplitude;
            let gen = map(compound_noise(j, i, 5), -1, 1, -10, 10) * 3;
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
    //gui = new dat.GUI();

    generators = [new SimplexNoise(), new SimplexNoise(), new SimplexNoise(), new SimplexNoise(), new SimplexNoise()];

    // Create the gui
    //gui.add(terrain_properties, 'frequency', 0, 0.2).onChange(update_geometry);
    //gui.add(terrain_properties, 'amplitude', 0, 2).onChange(update_geometry);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf3f2e5);

    controls.enableDamping = false;
    controls.enablePan = false;

    document.body.appendChild(renderer.domElement);

    camera.position.set(0, 120, 150);
    camera.lookAt(0, 0, 0);
    controls.update();
}

function animate() {
	requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

init();
init_terrain();
animate();