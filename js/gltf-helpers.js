/**
 * GLTF-Laden und Platzierung — DRY für Straßengebäude und Spezialfälle.
 * Voraussetzung: global THREE, WS.CONFIG
 */
(function (global) {
    'use strict';
    global.WS = global.WS || {};

    function cfg() {
        return global.WS.CONFIG;
    }

    /**
     * Skaliert und platziert ein Root-Objekt entlang Nord- (z+) oder Süd-Bürgersteig (z-).
     * @param {THREE.Object3D} model
     * @param {{ x:number, height:number, side:'north'|'south', rotation?:number }} opts
     */
    function placeScaledOnSidewalk(model, opts) {
        const C = cfg();
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const scale = opts.height / size.y;
        model.scale.set(scale, scale, scale);

        const center = box.getCenter(new THREE.Vector3());
        const sx = size.x * scale;
        const sy = size.y * scale;
        const sz = size.z * scale;
        void sx;
        void sy;

        model.position.x = opts.x - center.x * scale;
        model.position.y = C.GROUND_SURFACE_EPSILON - box.min.y * scale;

        const cz = center.z * scale;
        if (opts.side === 'north') {
            model.position.z = C.SIDEWALK_NORTH_Z + sz / 2 - cz;
        } else {
            model.position.z = C.SIDEWALK_SOUTH_Z - sz / 2 + cz;
        }

        if (opts.rotation !== undefined) {
            model.rotation.y = opts.rotation;
        } else {
            model.rotation.y = opts.side === 'south' ? Math.PI : 0;
        }
    }

    function loadStandardBuildings(loader, scene, buildings) {
        buildings.forEach((b) => {
            loader.load(
                b.path,
                (gltf) => {
                    const model = gltf.scene;
                    placeScaledOnSidewalk(model, b);
                    scene.add(model);
                    if (b.log) console.log('✅', b.log);
                },
                undefined,
                (err) => console.error('❌ GLB', b.path, err)
            );
        });
    }

    /**
     * @param {THREE.GLTFLoader} loader
     * @param {THREE.Scene} scene
     * @param {(eye: THREE.Object3D) => void} onLoaded
     */
    function loadEyeSun(loader, scene, onLoaded) {
        const C = cfg();
        loader.load(
            C.EYE_SUN_PATH,
            (gltf) => {
                const eyeSun = gltf.scene;
                const box = new THREE.Box3().setFromObject(eyeSun);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = C.EYE_SUN_TARGET_SIZE / maxDim;
                eyeSun.scale.set(scale, scale, scale);

                const center = box.getCenter(new THREE.Vector3());
                eyeSun.position.x += eyeSun.position.x - center.x;
                eyeSun.position.y = C.EYE_SUN_Y;
                eyeSun.position.z += eyeSun.position.z - center.z;

                eyeSun.traverse((child) => {
                    if (child.isMesh) {
                        child.material.side = THREE.DoubleSide;
                        if (child.material.emissive) {
                            child.material.emissive.setHex(0x333333);
                        }
                        child.frustumCulled = false;
                    }
                });
                scene.add(eyeSun);
                if (typeof onLoaded === 'function') onLoaded(eyeSun);
            },
            undefined,
            (err) => console.error('❌ Fehler beim Laden des GLB:', err)
        );
    }

    function loadBoundaryWalls(loader, scene) {
        const C = cfg();
        loader.load(
            C.BOUNDARY_WALL_PATH,
            (gltf) => {
                const wallSection = gltf.scene;
                const box = new THREE.Box3().setFromObject(wallSection);
                const size = box.getSize(new THREE.Vector3());
                const scale = C.BOUNDARY_WALL_HEIGHT / size.y;
                wallSection.scale.set(scale, scale, scale);

                const sectionWidth = size.x * scale;
                const mapHalf = C.MAP_HALF;
                const groundY = -box.min.y * scale;

                function addWallLine(startCoord, endCoord, fixedCoord, axis, rotation) {
                    for (let c = startCoord - sectionWidth; c <= endCoord + sectionWidth; c += sectionWidth) {
                        const clone = wallSection.clone();
                        if (axis === 'x') {
                            clone.position.set(c, groundY, fixedCoord);
                        } else {
                            clone.position.set(fixedCoord, groundY, c);
                        }
                        clone.rotation.y = rotation;
                        scene.add(clone);
                    }
                }

                addWallLine(-mapHalf, mapHalf, -mapHalf, 'x', 0);
                addWallLine(-mapHalf, mapHalf, mapHalf, 'x', Math.PI);
                addWallLine(-mapHalf, mapHalf, mapHalf, 'z', -Math.PI / 2);
                addWallLine(-mapHalf, mapHalf, -mapHalf, 'z', Math.PI / 2);

                console.log('✅ Distressed Painted Walls als Map-Grenze platziert');
            },
            undefined,
            (err) => console.error('❌ Grenzmauer GLB', err)
        );
    }

    function loadBrooklynSouthRow(loader, scene) {
        loader.load('assets/glb/brooklyn_street_cornerhouse_low_poly.glb', (gltf) => {
            const model = gltf.scene;
            placeScaledOnSidewalk(model, { x: 0, height: 60, side: 'south', rotation: Math.PI });
            scene.add(model);
            console.log('✅ Brooklyn Cornerhouse auf der anderen Seite platziert');
        });

        loader.load('assets/glb/brooklyn_street_building_low_poly.glb', (gltf) => {
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const scale = 60 / size.y;
            model.scale.set(scale, scale, scale);
            const center = box.getCenter(new THREE.Vector3());
            const zOffset = C.SIDEWALK_SOUTH_Z - (size.z * scale) / 2 + center.z * scale;

            function addBrooklynOtherSide(x) {
                const clone = model.clone();
                clone.position.set(x - center.x * scale, C.GROUND_SURFACE_EPSILON - box.min.y * scale, zOffset);
                clone.rotation.y = Math.PI;
                scene.add(clone);
            }

            addBrooklynOtherSide(-65);
            addBrooklynOtherSide(-130);
            addBrooklynOtherSide(65);
            addBrooklynOtherSide(130);

            console.log('✅ Mehrere Brooklyn Gebäude auf der anderen Seite platziert');
        });
    }

    global.WS.gltfHelpers = {
        placeScaledOnSidewalk,
        loadStandardBuildings,
        loadEyeSun,
        loadBoundaryWalls,
        loadBrooklynSouthRow
    };
})(typeof window !== 'undefined' ? window : this);
