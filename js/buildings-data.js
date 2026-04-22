/**
 * Gebäude-Metadaten: ein Eintrag pro GLB-Ladung (Standard-Straßenplatzierung).
 * rotation optional; sonst Default aus Platzierungs-Helper (Nord 0, Süd π).
 */
(function (global) {
    'use strict';
    global.WS = global.WS || {};
    const PI = Math.PI;

    global.WS.BUILDINGS = [
        { path: 'assets/glb/5_buildings_low-poly.glb', x: -300, height: 55, side: 'north', log: '5 Gebäude bei x=-300 platziert' },
        { path: 'assets/glb/psx_japanese_apartment.glb', x: -200, height: 55, side: 'north', log: 'Japanisches Apartment bei x=-200 platziert' },
        { path: 'assets/glb/psx_japanese_house.glb', x: -130, height: 50, side: 'north', log: 'Japanisches Haus bei x=-130 platziert' },
        { path: 'assets/glb/psx_-_apartment.glb', x: -70, height: 55, side: 'north', log: 'Apartment bei x=-70 platziert' },
        { path: 'assets/glb/brooklyn_street_building_low_poly.glb', x: 0, height: 60, side: 'north', log: 'Brooklyn Gebäude exakt an der Bürgersteigkante platziert' },
        { path: 'assets/glb/abandoned_building_gameready.glb', x: 70, height: 50, side: 'north', log: 'Verlassenes Gebäude bei x=70 platziert' },
        { path: 'assets/glb/old_japanese_store.glb', x: 140, height: 45, side: 'north', rotation: PI, log: 'Japanischer Laden bei x=140 platziert' },
        { path: 'assets/glb/old_concete_building_pack__lowpoly.glb', x: 330, height: 55, side: 'north', rotation: PI, log: 'Altes Betongebäude bei x=330 platziert' },
        { path: 'assets/glb/brick_shop_building__lowpoly.glb', x: 440, height: 50, side: 'north', log: 'Brick Shop bei x=440 platziert' },
        { path: 'assets/glb/free_-_sm_simplebuilding_1a_-_public_domain.glb', x: 550, height: 170, side: 'north', log: 'Einfaches Gebäude bei x=550 verdoppelt' }
    ];
})(typeof window !== 'undefined' ? window : this);
