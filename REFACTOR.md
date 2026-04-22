# Refactor-Dokumentation — 3D Walking Simulator

Dieses Dokument beschreibt die **Ausgangslage**, die **Ziele**, die **Zielarchitektur** und den **Umsetzungsstand** der Code-Basis. Es ist die zentrale Referenz für alle strukturellen Änderungen am Projekt.

---

## 1. Ausgangslage (vor Refactor)

- **Eine monolithische Datei** `index.html` mit eingebettetem CSS und ~580 Zeilen Inline-JavaScript.
- **Wiederholte Logik** beim Laden und Platzieren von GLB-Gebäuden (Bounding Box, Skalierung, Position — fast identisch pro Gebäude).
- **Magic Numbers** direkt im Code (Geschwindigkeiten, Kartengröße, Höhen, Tag/Nacht-Schwellen) ohne zentrale Konstanten.
- **Keine Trennung** zwischen Daten (welches Gebäude wo) und Logik (wie platziert wird).
- **Start-Hinweis** erwähnte „Dynamische Wolken“, obwohl im Code keine Wolken implementiert sind — **behoben** durch ehrliche UI-Texte (oder später echte Wolken + Doku).

---

## 2. Refactor-Ziele

| Ziel | Beschreibung |
|------|----------------|
| **Modularität** | CSS und JS in eigenen Dateien; klar getrennte Verantwortlichkeiten. |
| **DRY** | Eine gemeinsame Platzierungs-Logik für Standard-Gebäude entlang der Straße. |
| **Wartbarkeit** | Neue Gebäude primär über Einträge in einer Datenliste, nicht durch Copy-Paste. |
| **Konfiguration** | Spiel- und Welt-Konstanten unter `WS.CONFIG` (Namespace `WS`). |
| **Kein Build-Zwang** | Weiterhin per statischem HTTP-Server lauffähig (kein Bundler-Pflichtschritt). |
| **Verhalten** | Gleiche Three.js-Version (r134) und gleiche CDN-Einbindung wie zuvor. |

---

## 3. Ziel-Dateistruktur

```
3dgame/
├── AGENTPROTOCOL.md      # Chronologisches Agenten-Protokoll + Regelwerk
├── REFACTOR.md           # Diese Datei
├── README.md
├── index.html            # Shell: Markup, Script-Tags, externe CSS
├── styles.css            # Retro-Windows-HUD und Layout
├── js/
│   ├── constants.js      # WS.CONFIG, WS.VERSION
│   ├── buildings-data.js # WS.BROOKLYN_ROW_ITEMS, WS.OTHER_ROW_BUILDINGS
│   ├── gltf-helpers.js # Platzierung, Laden der Gebäude-Liste, Auge, Südfassade, Grenzmauer
│   └── game.js           # State, init(), animate(), Input, Texturen, Lichter, Boden
└── assets/
    ├── glb/
    └── textures/          # WS.CONFIG.TEXTURES (relative Pfade)
```

---

## 4. Umsetzungsphasen (Checkliste)

| Phase | Inhalt | Status |
|-------|--------|--------|
| **A** | `REFACTOR.md` / `AGENTPROTOCOL.md` anlegen | erledigt |
| **B** | CSS → `styles.css` | erledigt |
| **C** | `constants.js` + `buildings-data.js` | erledigt |
| **D** | `gltf-helpers.js` (DRY-Platzierung, Speziallasten) | erledigt |
| **E** | `game.js` + schlankes `index.html` | erledigt |
| **F** | Manueller Smoke-Test (Lokaler Server, Konsole, Bewegung) | durch Maintainer / Agent vor Merge |

Nach Änderungen an `js/` oder `index.html`: Phase F kurz ausführen (siehe `AGENTPROTOCOL.md` Checkliste).

---

## 5. Technische Notizen

- **Global `THREE`**: Skripte nach `three.min.js` und `GLTFLoader.js` laden; kein ES-Module-Bundle erforderlich.
- **Namespace `WS`**: `window.WS` bündelt `CONFIG`, `OTHER_ROW_BUILDINGS`, optional später `state` — erweiterbar ohne Pollution.
- **Südfassade (Brooklyn-Reihe)**: Bleibt bewusst in `gltf-helpers.js` gekapselt (Cornerhouse + geklonte Gebäude), da mehrere Instanzen aus einem GLTF entstehen.
- **Risiken**: Fehlende Asset-Dateien führen weiterhin zu Lade-Fehlern in der Konsole — kein Refactor-Thema, aber beim Test prüfen.

---

## 6. Nächste sinnvolle Schritte (Backlog, nicht Teil dieses Refactors)

- Echtes Wolken-System oder Entfernen aller Wolken-Claims in Marketing-Texten.
- Lade-Fortschritt / Error-Overlay für fehlende GLBs.
- Einfache Kollision (Capsule vs. Boxen).
- Optional: Vite + ES-Modules + `three` aus npm für sauberere Imports.

---

*Letzte inhaltliche Aktualisierung: siehe `AGENTPROTOCOL.md` (Eintrag vom gleichen Arbeitstag).*
