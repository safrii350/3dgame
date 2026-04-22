# 3D First Person Walking Simulator

Ein Retro-inspirierter First-Person-Walking-Simulator mit Three.js. Erkunde eine stilisierte 3D-Stadt mit Tag-/Nachtzyklus, Gebäuden und interaktiver Steuerung im Stil der frühen 2000er.

## Features
- First-Person-Steuerung (WASD, Maus, Space, Shift)
- Tag-/Nachtzyklus mit dynamischem Himmel und Sternen
- Verschiedene Gebäude und Assets im PSX/Lowpoly-Stil
- Pointer-Lock für immersives Gameplay
- HUD im Windows-2000-Look

## Steuerung
- **WASD**: Laufen / Fliegen
- **Maus**: Umschauen
- **Leertaste**: Springen / Hoch (Viewer Mode)
- **Shift**: Runter (Viewer Mode)
- **C**: Viewer Mode AN/AUS
- **ESC**: Maus freigeben

## Assets
Alle 3D-Modelle liegen im Ordner `assets/glb/` und werden automatisch beim Start geladen. Texturen befinden sich im Projektverzeichnis.

## Starten
1. Projekt lokal klonen:
   ```
   git clone <repo-url>
   ```
2. Öffne das Projekt in einem lokalen Webserver (z.B. mit VS Code Live Server oder Python):
   ```
   # Mit Python 3
   python -m http.server
   ```
3. Rufe im Browser `http://localhost:8000` auf.

## Voraussetzungen
- Ein moderner Browser (Chrome, Firefox, Edge)
- Keine Installation notwendig

## Hinweise
- Die Steuerung und das Gameplay sind auf Desktop optimiert.
- Die Modelle und Texturen sind für schnelle Ladezeiten optimiert.

## Lizenz
Dieses Projekt steht unter der MIT-Lizenz. Siehe LICENSE für Details.
