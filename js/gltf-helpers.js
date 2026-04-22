/**
 * GLTF-Laden und Platzierung — Straßenreihen mit Front an Bürgersteig (BBox-Kanten).
 */
(function (global) {
    'use strict';
    global.WS = global.WS || {};

    function cfg() {
        return global.WS.CONFIG;
    }

    /**
     * Skaliert, rotiert und setzt ein Gebäude in eine Reihe: Boden, Front an Bürgersteig, dann X von cursor.
     * @param {THREE.Object3D} model
     * @param {'north'|'south'} side — north: Front bei min-Z zur Straße; south: Front bei max-Z (nach Rotation).
     * @param {number} targetHeight — Zielhöhe (Y-Umfang nach Skalierung).
     * @param {number} gap — Abstand zum nächsten Haus entlang +X.
     * @param {{ cursorX: number }} state — wird um Gebäudebreite + gap weitergeschoben.
     * @param {number} [rotationY] — optional, überschreibt Default (Nord 0, Süd π).
     */
    function placeOnSidewalkRow(model, side, targetHeight, gap, state, rotationY) {
        const C = cfg();
        const box0 = new THREE.Box3().setFromObject(model);
        const size = box0.getSize(new THREE.Vector3());
        const scale = targetHeight / size.y;
        model.scale.set(scale, scale, scale);

        const rot = rotationY !== undefined ? rotationY : (side === 'south' ? Math.PI : 0);
        model.rotation.y = rot;
        model.position.set(0, 0, 0);
        model.updateMatrixWorld(true);

        let b = new THREE.Box3().setFromObject(model);
        model.position.y = C.GROUND_SURFACE_EPSILON - b.min.y;
        model.updateMatrixWorld(true);
        b = new THREE.Box3().setFromObject(model);

        if (side === 'north') {
            model.position.z = C.SIDEWALK_NORTH_Z - b.min.z;
        } else {
            model.position.z = C.SIDEWALK_SOUTH_Z - b.max.z;
        }
        model.updateMatrixWorld(true);
        b = new THREE.Box3().setFromObject(model);

        model.position.x = state.cursorX - b.min.x;
        model.updateMatrixWorld(true);
        b = new THREE.Box3().setFromObject(model);
        state.cursorX = b.max.x + gap;
    }

    function loadBrooklynRow(loader, scene, rowItems) {
        const C = cfg();
        const gap = C.BUILDING_ROW_GAP;
        const state = { cursorX: C.BUILDING_ROW_START_X };
        const side = C.BROOKLYN_ROW_SIDE;
        const rotExtra = C.BROOKLYN_ROW_ROTATION;
        const items = rowItems || [];

        function loadGroup(index) {
            if (index >= items.length) {
                console.log('✅ Brooklyn-Reihe fertig:', items.length, 'GLB-Gruppen');
                return;
            }
            const spec = items[index];
            const count = spec.count != null ? spec.count : 1;
            loader.load(
                spec.path,
                (gltf) => {
                    const template = gltf.scene;
                    for (let i = 0; i < count; i++) {
                        const inst = template.clone(true);
                        placeOnSidewalkRow(inst, side, spec.height, gap, state, spec.rotation != null ? spec.rotation : rotExtra);
                        scene.add(inst);
                    }
                    console.log('✅ Brooklyn', count + '×', spec.path);
                    loadGroup(index + 1);
                },
                undefined,
                (err) => {
                    console.error('❌ Brooklyn GLB', spec.path, err);
                    loadGroup(index + 1);
                }
            );
        }

        loadGroup(0);
    }

    function loadOtherSideRow(loader, scene, buildingList) {
        const C = cfg();
        const gap = C.BUILDING_ROW_GAP;
        const state = { cursorX: C.BUILDING_ROW_START_X };
        const side = C.OTHER_ROW_SIDE;

        function loadNext(index) {
            if (index >= buildingList.length) {
                console.log('✅ Gegenüberreihe fertig:', buildingList.length, 'Gebäude');
                return;
            }
            const spec = buildingList[index];
            loader.load(
                spec.path,
                (gltf) => {
                    const inst = gltf.scene;
                    placeOnSidewalkRow(inst, side, spec.height, gap, state, spec.rotation);
                    scene.add(inst);
                    console.log('✅ Reihe', index + 1 + '/' + buildingList.length, spec.path);
                    loadNext(index + 1);
                },
                undefined,
                (err) => {
                    console.error('❌ GLB', spec.path, err);
                    loadNext(index + 1);
                }
            );
        }

        loadNext(0);
    }

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

    global.WS.gltfHelpers = {
        placeOnSidewalkRow,
        loadBrooklynRow,
        loadOtherSideRow,
        loadEyeSun,
        loadBoundaryWalls
    };
})(typeof window !== 'undefined' ? window : this);
