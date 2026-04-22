/**
 * Hauptspiellogik: Szene, Loop, Input, Tag/Nacht.
 * Lädt nach constants, buildings-data, gltf-helpers.
 */
(function () {
    'use strict';

    const C = window.WS.CONFIG;
    const gltfH = window.WS.gltfHelpers;

    let scene, camera, renderer, player;
    let move = { forward: false, backward: false, left: false, right: false, up: false, down: false };
    let velocity = new THREE.Vector3();
    let controlsEnabled = false;
    let viewerMode = false;
    let timeOfDay = 0.3;
    let yaw = 0;
    let pitch = 0;

    let grassTexture, roadTexture, sidewalkTexture;
    let ground, road, leftSidewalk, rightSidewalk;
    let eyeSun, skyMat, starField, ambientLight, hemiLight, sunLight, eyeLight;

    let prevTime = performance.now();

    function createSkyAndStars() {
        const vertexShader = `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        const fragmentShader = `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
        `;
        const skyGeo = new THREE.SphereGeometry(C.SKY_RADIUS, C.SKY_SEGMENTS, C.SKY_RINGS);
        skyMat = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                topColor: { value: new THREE.Color(C.COLOR_DAY_SKY_TOP) },
                bottomColor: { value: new THREE.Color(C.COLOR_DAY_SKY_BOTTOM) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeo, skyMat);
        scene.add(sky);

        const starGeo = new THREE.BufferGeometry();
        const starCoords = [];
        for (let i = 0; i < C.STAR_COUNT; i++) {
            const x = THREE.MathUtils.randFloatSpread(C.STAR_SPREAD);
            const y = THREE.MathUtils.randFloat(C.STAR_Y_MIN, C.STAR_Y_MAX);
            const z = THREE.MathUtils.randFloatSpread(C.STAR_SPREAD);
            starCoords.push(x, y, z);
        }
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: C.STAR_SIZE,
            transparent: true,
            opacity: 0
        });
        starField = new THREE.Points(starGeo, starMat);
        scene.add(starField);

        scene.fog = new THREE.Fog(C.FOG_COLOR_DAY, C.FOG_NEAR, C.FOG_FAR);
    }

    function createGroundRoadSidewalks() {
        const geo = new THREE.PlaneGeometry(C.GROUND_SIZE, C.GROUND_SIZE);
        ground = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0x339933 }));
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);

        road = new THREE.Mesh(
            new THREE.PlaneGeometry(C.ROAD_LENGTH, C.ROAD_WIDTH),
            new THREE.MeshLambertMaterial({ color: 0x555555 })
        );
        road.rotation.x = -Math.PI / 2;
        road.position.set(0, 0.03, 0);
        scene.add(road);

        const sidewalkGeo = new THREE.PlaneGeometry(C.ROAD_LENGTH, C.SIDEWALK_DEPTH);
        leftSidewalk = new THREE.Mesh(sidewalkGeo, new THREE.MeshLambertMaterial({ color: 0xaaaaaa }));
        leftSidewalk.rotation.x = -Math.PI / 2;
        leftSidewalk.position.set(0, C.GROUND_SURFACE_EPSILON, C.SIDEWALK_OFFSET_Z);
        scene.add(leftSidewalk);

        rightSidewalk = new THREE.Mesh(sidewalkGeo, new THREE.MeshLambertMaterial({ color: 0xaaaaaa }));
        rightSidewalk.rotation.x = -Math.PI / 2;
        rightSidewalk.position.set(0, C.GROUND_SURFACE_EPSILON, -C.SIDEWALK_OFFSET_Z);
        scene.add(rightSidewalk);
    }

    function setupLights() {
        ambientLight = new THREE.AmbientLight(0xffffff, C.LIGHT_AMBIENT_DAY);
        scene.add(ambientLight);

        hemiLight = new THREE.HemisphereLight(0xffffff, 0x888888, C.LIGHT_HEMI_DAY);
        scene.add(hemiLight);

        sunLight = new THREE.DirectionalLight(0xffffee, C.LIGHT_SUN_DAY);
        sunLight.position.set(100, 400, 100);
        scene.add(sunLight);

        eyeLight = new THREE.PointLight(0xffffff, C.LIGHT_EYE_DAY, 2000);
        eyeLight.position.set(0, C.EYE_SUN_Y, 0);
        scene.add(eyeLight);
    }

    function loadTextures(loader) {
        const T = C.TEXTURES;
        grassTexture = loader.load(T.grass, (t) => {
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(C.GRASS_REPEAT.x, C.GRASS_REPEAT.y);
            if (ground) {
                ground.material.map = t;
                ground.material.color.set(0xffffff);
                ground.material.needsUpdate = true;
            }
            console.log('✅ grass.png');
        });
        loader.load(T.wall, () => console.log('✅ wand.png'));
        loader.load(T.roof, () => console.log('✅ dach.png'));
        roadTexture = loader.load(T.road, (t) => {
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(C.ROAD_REPEAT.x, C.ROAD_REPEAT.y);
            if (road) {
                road.material.map = t;
                road.material.needsUpdate = true;
            }
            console.log('✅ road.png');
        });
        sidewalkTexture = loader.load(T.sidewalk, (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(C.SIDEWALK_REPEAT.x, C.SIDEWALK_REPEAT.y);
            console.log('✅ bürgersteig.png');
            if (leftSidewalk) {
                leftSidewalk.material.map = texture;
                leftSidewalk.material.color.set(0xffffff);
                leftSidewalk.material.needsUpdate = true;
            }
            if (rightSidewalk) {
                rightSidewalk.material.map = texture;
                rightSidewalk.material.color.set(0xffffff);
                rightSidewalk.material.needsUpdate = true;
            }
        });
        loader.load(T.berg, (t) => {
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            console.log('✅ berg.png');
        });
    }

    function bindInput() {
        const blocker = document.getElementById('blocker');
        blocker.addEventListener('click', () => renderer.domElement.requestPointerLock());

        document.addEventListener('pointerlockchange', () => {
            controlsEnabled = document.pointerLockElement === renderer.domElement;
            blocker.style.display = controlsEnabled ? 'none' : 'flex';
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyW') move.forward = true;
            if (e.code === 'KeyS') move.backward = true;
            if (e.code === 'KeyA') move.left = true;
            if (e.code === 'KeyD') move.right = true;
            if (e.code === 'Space') {
                if (viewerMode) move.up = true;
                else if (player.position.y <= C.PLAYER_JUMP_THRESHOLD_Y) velocity.y = C.JUMP_VELOCITY;
            }
            if (e.code === 'ShiftLeft') move.down = true;

            if (e.code === 'KeyC') {
                viewerMode = !viewerMode;
                console.log('🎥 Viewer Mode:', viewerMode ? 'AN' : 'AUS');
                velocity.set(0, 0, 0);
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.code === 'KeyW') move.forward = false;
            if (e.code === 'KeyS') move.backward = false;
            if (e.code === 'KeyA') move.left = false;
            if (e.code === 'KeyD') move.right = false;
            if (e.code === 'Space') move.up = false;
            if (e.code === 'ShiftLeft') move.down = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (!controlsEnabled) return;
            yaw -= e.movementX * C.MOUSE_SENSITIVITY;
            pitch -= e.movementY * C.MOUSE_SENSITIVITY;
            pitch = Math.max(C.PITCH_MIN, Math.min(C.PITCH_MAX, pitch));
            player.rotation.y = yaw;
            camera.rotation.x = pitch;
        });

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    function init() {
        console.log('🚀 Spiel startet – Zentrales Auge als Sonne');

        scene = new THREE.Scene();
        createSkyAndStars();

        player = new THREE.Object3D();
        player.position.set(C.PLAYER_START.x, C.PLAYER_START.y, C.PLAYER_START.z);
        scene.add(player);

        camera = new THREE.PerspectiveCamera(
            C.CAMERA_FOV,
            window.innerWidth / window.innerHeight,
            C.CAMERA_NEAR,
            C.CAMERA_FAR
        );
        camera.position.set(0, 0, 0);
        player.add(camera);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        const texLoader = new THREE.TextureLoader();
        createGroundRoadSidewalks();
        setupLights();
        loadTextures(texLoader);

        const gltfLoader = new THREE.GLTFLoader();
        gltfH.loadBrooklynRow(gltfLoader, scene, window.WS.BROOKLYN_ROW_ITEMS);
        gltfH.loadOtherSideRow(gltfLoader, scene, window.WS.OTHER_ROW_BUILDINGS);
        if (C.FEATURE_EYE_SUN) {
            gltfH.loadEyeSun(gltfLoader, scene, (eye) => {
                eyeSun = eye;
            });
        }
        if (C.FEATURE_BOUNDARY_WALLS) {
            gltfH.loadBoundaryWalls(gltfLoader, scene);
        }

        bindInput();
        animate();
    }

    function animate() {
        requestAnimationFrame(animate);
        const time = performance.now();
        const delta = (time - prevTime) / 1000;
        prevTime = time;

        if (controlsEnabled) {
            const speed = (viewerMode ? C.FLY_SPEED : C.WALK_SPEED) * delta;
            const forward = (move.forward ? 1 : 0) - (move.backward ? 1 : 0);
            const strafe = (move.right ? 1 : 0) - (move.left ? 1 : 0);

            player.translateZ(-forward * speed);
            player.translateX(strafe * speed);

            if (viewerMode) {
                const upDown = (move.up ? 1 : 0) - (move.down ? 1 : 0);
                player.position.y += upDown * speed;
            } else {
                velocity.y -= C.GRAVITY * delta;
                player.position.y += velocity.y * delta;
                if (player.position.y < C.PLAYER_FLOOR_Y) {
                    player.position.y = C.PLAYER_FLOOR_Y;
                    velocity.y = 0;
                }
            }
        }

        timeOfDay = (timeOfDay + C.TIME_SPEED) % 1;
        const isDay = timeOfDay > C.DAY_START && timeOfDay < C.DAY_END;

        let mixFactor = 0;
        if (timeOfDay > C.MIX_SUNRISE_START && timeOfDay < C.MIX_SUNRISE_END) {
            mixFactor = (timeOfDay - C.MIX_SUNRISE_START) * 10;
        } else if (timeOfDay >= C.MIX_SUNRISE_END && timeOfDay <= C.MIX_DAY_END) {
            mixFactor = 1;
        } else if (timeOfDay > C.MIX_DAY_END && timeOfDay < C.MIX_SUNSET_END) {
            mixFactor = 1 - (timeOfDay - C.MIX_DAY_END) * 10;
        } else {
            mixFactor = 0;
        }

        const dayTop = new THREE.Color(C.COLOR_DAY_SKY_TOP);
        const dayBottom = new THREE.Color(C.COLOR_DAY_SKY_BOTTOM);
        const nightTop = new THREE.Color(C.COLOR_NIGHT_SKY_TOP);
        const nightBottom = new THREE.Color(C.COLOR_NIGHT_SKY_BOTTOM);

        if (skyMat) {
            skyMat.uniforms.topColor.value.lerpColors(nightTop, dayTop, mixFactor);
            skyMat.uniforms.bottomColor.value.lerpColors(nightBottom, dayBottom, mixFactor);
            scene.fog.color.lerpColors(nightTop, dayTop, mixFactor);
        }

        if (ambientLight) {
            ambientLight.intensity = THREE.MathUtils.lerp(C.LIGHT_AMBIENT_NIGHT, C.LIGHT_AMBIENT_DAY, mixFactor);
        }
        if (hemiLight) {
            hemiLight.intensity = THREE.MathUtils.lerp(C.LIGHT_HEMI_NIGHT, C.LIGHT_HEMI_DAY, mixFactor);
        }
        if (sunLight) {
            sunLight.intensity = THREE.MathUtils.lerp(C.LIGHT_SUN_NIGHT, C.LIGHT_SUN_DAY, mixFactor);
        }
        if (eyeLight) {
            eyeLight.intensity = THREE.MathUtils.lerp(C.LIGHT_EYE_NIGHT, C.LIGHT_EYE_DAY, mixFactor);
        }

        if (starField) {
            starField.material.opacity = 1 - mixFactor;
            starField.rotation.y += delta * C.STAR_ROT_SPEED;
        }

        const hours = Math.floor(timeOfDay * 24);
        const mins = Math.floor(((timeOfDay * 24) % 1) * 60);
        document.getElementById('time').textContent = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        document.getElementById('dayNight').textContent = isDay ? '☀️ Tag' : '🌙 Nacht';

        if (eyeSun) {
            eyeSun.lookAt(player.position);
        }

        renderer.render(scene, camera);
    }

    window.onload = init;
})();
