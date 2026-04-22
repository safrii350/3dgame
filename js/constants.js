/**
 * Zentrale Konfiguration für den Walking Simulator.
 * Wird nach Three.js geladen; nutzt globales window.
 */
(function (global) {
    'use strict';
    global.WS = global.WS || {};
    global.WS.VERSION = '0.2.0';

    global.WS.CONFIG = {
        PLAYER_START: { x: 0, y: 12, z: 40 },
        CAMERA_FOV: 75,
        CAMERA_NEAR: 0.1,
        CAMERA_FAR: 3000,

        MOUSE_SENSITIVITY: 0.0022,
        PITCH_MIN: -1.4,
        PITCH_MAX: 1.4,

        WALK_SPEED: 140,
        FLY_SPEED: 300,
        GRAVITY: 45,
        JUMP_VELOCITY: 18,
        PLAYER_FLOOR_Y: 8,
        PLAYER_JUMP_THRESHOLD_Y: 8.01,

        SIDEWALK_NORTH_Z: 26,
        SIDEWALK_SOUTH_Z: -26,
        GROUND_SURFACE_EPSILON: 0.06,

        MAP_HALF: 700,
        BOUNDARY_WALL_HEIGHT: 100,
        BOUNDARY_WALL_PATH: 'assets/glb/distressed_painted_wall_6.4m_section.glb',

        SKY_RADIUS: 1000,
        SKY_SEGMENTS: 32,
        SKY_RINGS: 15,
        STAR_COUNT: 5000,
        STAR_SPREAD: 1800,
        STAR_Y_MIN: 100,
        STAR_Y_MAX: 1000,
        STAR_SIZE: 1.5,

        FOG_NEAR: 200,
        FOG_FAR: 1500,
        FOG_COLOR_DAY: 0x88bbff,

        GROUND_SIZE: 1400,
        ROAD_WIDTH: 28,
        ROAD_LENGTH: 1450,
        SIDEWALK_DEPTH: 12,
        SIDEWALK_OFFSET_Z: 20,

        EYE_SUN_PATH: 'assets/glb/anatomical_eye_ball.glb',
        EYE_SUN_Y: 350,
        EYE_SUN_TARGET_SIZE: 80,

        LIGHT_AMBIENT_DAY: 0.45,
        LIGHT_AMBIENT_NIGHT: 0.05,
        LIGHT_HEMI_DAY: 0.55,
        LIGHT_HEMI_NIGHT: 0.08,
        LIGHT_SUN_DAY: 0.8,
        LIGHT_SUN_NIGHT: 0,
        LIGHT_EYE_DAY: 1.0,
        LIGHT_EYE_NIGHT: 0.3,

        TIME_SPEED: 0.0004,
        DAY_START: 0.22,
        DAY_END: 0.72,
        MIX_SUNRISE_START: 0.15,
        MIX_SUNRISE_END: 0.25,
        MIX_DAY_END: 0.65,
        MIX_SUNSET_END: 0.75,

        COLOR_DAY_SKY_TOP: 0x0077ff,
        COLOR_DAY_SKY_BOTTOM: 0xffffff,
        COLOR_NIGHT_SKY_TOP: 0x000005,
        COLOR_NIGHT_SKY_BOTTOM: 0x000011,

        STAR_ROT_SPEED: 0.02,

        TEXTURES: {
            grass: 'assets/textures/grass.png',
            wall: 'assets/textures/wand.png',
            roof: 'assets/textures/dach.png',
            road: 'assets/textures/road.png',
            sidewalk: 'assets/textures/bürgersteig.png',
            berg: 'assets/textures/berg.png'
        },
        GRASS_REPEAT: { x: 40, y: 40 },
        ROAD_REPEAT: { x: 15, y: 1 },
        SIDEWALK_REPEAT: { x: 60, y: 1 }
    };
})(typeof window !== 'undefined' ? window : this);
