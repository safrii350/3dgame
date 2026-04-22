/**
 * Brooklyn-Straßenseite: Gruppen aus demselben GLB (count), nacheinander geladen.
 * Gegenüber: alle übrigen Stadt-GLBs (ohne Auge, ohne Grenzmauer-Segment).
 *
 * Optional pro Eintrag: rotation (rad).
 */
(function (global) {
    'use strict';
    global.WS = global.WS || {};

    global.WS.BROOKLYN_ROW_ITEMS = [
        { path: 'assets/glb/brooklyn_building_grafiti.glb', height: 60, count: 3, rotation: Math.PI / 2 },
        { path: 'assets/glb/psx_-_apartment.glb', height: 60, count: 1, rotation: Math.PI / 2 },
        { path: 'assets/glb/brooklyn_street_building_low_poly.glb', height: 65, count: 3 },
        { path: 'assets/glb/brooklyn_street_cornerhouse_low_poly.glb', height: 65, count: 1 },
        { path: 'assets/glb/psx_japanese_apartment.glb', height: 65, count: 1, rotation: Math.PI / 2 },
        { path: 'assets/glb/psx_japanese_house.glb', height: 45, count: 1, rotation: Math.PI / 2 }
    ];

    global.WS.OTHER_ROW_BUILDINGS = [
        { path: 'assets/glb/5_buildings_low-poly.glb', height: 68, rotation: 0 },
        { path: 'assets/glb/abandoned_building_gameready.glb', height: 100 },
        { path: 'assets/glb/brick_shop_building__lowpoly.glb', height: 50, rotation: 0 },
        { path: 'assets/glb/old_concete_building_pack__lowpoly.glb', height: 55 },
        { path: 'assets/glb/old_japanese_store.glb', height: 46, rotation: 0 },
        { path: 'assets/glb/plattenbau_vergelbt.glb', height: 52, rotation: Math.PI / 2 },
        { path: 'assets/glb/tower_publichouse.glb', height: 125 },
        { path: 'assets/glb/toyko19sw_twintower.glb', height: 115, rotation: 0 },
        { path: 'assets/glb/toyko6sw_tower.glb', height: 125, rotation: 0 }
    ];
})(typeof window !== 'undefined' ? window : this);
