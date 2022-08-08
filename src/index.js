import './style.css'

import * as THREE from 'three'
import SimplexNoise from 'simplex-noise';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

var scene, camera, canvas, renderer, controls, gui, terrainMesh;
var generators;
var southMesh, southGeo, northMesh, northGeo, eastMesh, eastGeo, westMesh, westGeo;

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
        val += noise((x * freq) + 1, (y * freq) + 1, i) * amp;
        sum += amp;

        amp /= 2;
        freq *= 2;
    }
    return val/sum;  
}

function init_terrain() {
    let terrainGeometry = new THREE.PlaneGeometry(terrain_properties.width, terrain_properties.height, terrain_properties.width - 1, terrain_properties.height - 1);
    let baseGeometry = new THREE.PlaneGeometry(terrain_properties.width, terrain_properties.height);
    
    let material = new THREE.MeshBasicMaterial({color: 0x555555, wireframe: true});
    let wallMaterial = new THREE.MeshBasicMaterial({color: 0x555555});

    terrainMesh = new THREE.Mesh(terrainGeometry, material);
    terrainMesh.rotation.x = -Math.PI / 2;
    terrainMesh.rotation.z = Math.PI;

    let baseMesh = new THREE.Mesh(baseGeometry, wallMaterial)
    baseMesh.rotation.x = Math.PI / 2;
    baseMesh.position.set(0, -11, 0);


    southGeo = new THREE.PlaneGeometry(terrain_properties.width, 2, terrain_properties.width - 1, 1);
    southMesh = new THREE.Mesh(southGeo, wallMaterial);
    scene.add(southMesh);
    southMesh.position.set(0, -10, 75);

    northGeo = new THREE.PlaneGeometry(terrain_properties.width, 2, terrain_properties.width - 1, 1);
    northMesh = new THREE.Mesh(northGeo, wallMaterial);
    scene.add(northMesh);

    northMesh.rotation.y = Math.PI;
    northMesh.position.set(0, -10, -75);

    eastGeo = new THREE.PlaneGeometry(terrain_properties.width, 2, terrain_properties.width - 1, 1);
    eastMesh = new THREE.Mesh(eastGeo, wallMaterial);
    scene.add(eastMesh);

    eastMesh.rotation.y = Math.PI / 2;
    eastMesh.position.set(75, -10, 0);

    westGeo = new THREE.PlaneGeometry(terrain_properties.width, 2, terrain_properties.width - 1, 1);
    westMesh = new THREE.Mesh(westGeo, wallMaterial);
    scene.add(westMesh);

    westMesh.rotation.y = -Math.PI / 2;
    westMesh.position.set(-75, -10, 0);
    
    apply_noise(terrainGeometry);
    scene.add(terrainMesh);
    scene.add(baseMesh);

    
}

function update_geometry() {
    var newGeometry = new THREE.PlaneGeometry(terrain_properties.width, terrain_properties.height, terrain_properties.width - 1, terrain_properties.height - 1);
    apply_noise(newGeometry);

    mesh.geometry.dispose();
    mesh.geometry = newGeometry;
}

function apply_noise(geo) {
    let positions = geo.attributes.position.array;
    let southPositions = southGeo.attributes.position.array;
    let northPositions = northGeo.attributes.position.array;
    let eastPositions = eastGeo.attributes.position.array;
    let westPositions = westGeo.attributes.position.array;

    for (let i = 0; i < terrain_properties.width; i++) {
        for (let j = 0; j < terrain_properties.height; j++) {
            //let gen = map(octave(j, i, 1), 0, 1, -10, 10) * terrain_properties.amplitude;
            let gen = map(compound_noise(j, i, 5), -1, 1, -10, 10) * 3;
            let elevation;
 
            if (gen < 0) elevation = gen
            else elevation = 0
            
            positions[(i * terrain_properties.width + j) * 3 + 2] = -elevation + 10;
        }
    }

    for (let i = 0; i < terrain_properties.width; i++) {
        southPositions[i * 3 + 1] = 10 + positions[i * 3 + 2];
        northPositions[i * 3 + 1] = 10 + positions[positions.length - (i * 3 + 1)];
        eastPositions[(terrain_properties.width * 3) - (i * 3 + 2)] = 10 + positions[positions.length - (i * terrain_properties.height * 3 + 1)];
        westPositions[(terrain_properties.width * 3) - (i * 3 + 2)] = 10 + positions[i * terrain_properties.height * 3 + 2];
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

    controls.enableDamping = true;
    controls.enablePan = false;

    document.body.appendChild(renderer.domElement);

    camera.position.set(0, 120, 150);
    camera.lookAt(0, 0, 0);

    const light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set( 50, 50, 50 );
    scene.add( light );
}

function animate() {
	requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
};

init();
init_terrain();
animate();