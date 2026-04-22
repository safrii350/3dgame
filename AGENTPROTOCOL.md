# Agent-Protokoll & Regelwerk — 3D Walking Simulator

Dieses Dokument dient der **chronologischen Dokumentation** aller relevanten Änderungen am Projekt und definiert **verbindliche Regeln** für menschliche Entwickler und KI-Agents.

---

## Teil A — Protokoll-Schema

Jeder Eintrag wird **oben nach unten** ergänzt (neueste Einträge **am Anfang** der Tabelle, direkt unter dieser Überschrift).

### Pflichtfelder pro Eintrag

| Feld | Beschreibung |
|------|----------------|
| **Datum** | Format `YYYY-MM-DD` (autoritativ: Systemdatum zum Zeitpunkt des Commits bzw. der Änderung). |
| **Signatur** | Kurzname: `Human:<Name>` oder `Agent:<Modell/Tool>` oder `CI` — eindeutig zuordenbar. |
| **Was** | Prägnante Liste der Änderungen (Dateien, Features, Fixes). |
| **Warum** | Begründung: Ziel, Bug, Anforderung, Refactor-Phase. |
| **Referenzen** | Optional: Issue-, PR-Nummer, Ticket, Chat-Referenz. |

### Vorlage (Copy-Paste für neue Zeile)

```markdown
| DATUM | SIGNATUR | WAS | WARUM | REF |
|-------|----------|-----|-------|-----|
| YYYY-MM-DD | Agent:… / Human:… | … | … | — |
```

---

## Teil B — Protokoll (chronologisch, neu → alt)

| Datum | Signatur | Was | Warum | Ref |
|-------|----------|-----|-------|-----|
| 2026-04-22 | Agent:Lead-Gamedev | `WS.CONFIG.TEXTURES` in `js/constants.js` auf `assets/textures/…` umgestellt; `README.md` (Asset-Hinweis) angepasst. | Nutzer hat alle Texturen nach `assets/textures/` verschoben; Lade-URLs müssen stimmen. | User |
| 2026-04-22 | Agent:Lead-Gamedev | **Doku:** `REFACTOR.md` und `AGENTPROTOCOL.md` neu inkl. Regelwerk und Protokoll-Schema. **Code:** CSS nach `styles.css`; `js/constants.js` (`WS.CONFIG`), `js/buildings-data.js` (`WS.BUILDINGS`), `js/gltf-helpers.js` (Platzierung, Augen-Sonne, Grenzmauer, Brooklyn-Südfassade), `js/game.js` (Init, Loop, Input, Umgebung); `index.html` nur Shell + Script-Reihenfolge. Start-Text: „Wolken“ → „Sternenhimmel“ (ehrliche Feature-Beschreibung). | Lead-Game-Dev-Auftrag: professionelle Projektstruktur, DRY für GLB-Standardfälle, Konstanten zentral, Agenten-Protokoll für Folgearbeiten. | `REFACTOR.md` |

---

## Teil C — Regelwerk für alle Agents und Entwickler

### C.1 Abstimmung & Scope

1. **Keine inhaltlichen oder strukturellen Änderungen ohne Abstimmung** mit dem Projektverantwortlichen bzw. explizitem Auftrag — außer: reine Dokumentations-Korrekturen von Tippfehlern, sofern die Aussage unverändert bleibt.
2. **Kleinst möglicher Scope**: Nur das ändern, was für die aktuelle Aufgabe nötig ist; keine „mit refaktorierten“ Nebenbaustellen.
3. **Breaking Changes** (URLs, Pfade, öffentliche API, Spieler-Steuerung) immer im Protokoll und idealerweise in `REFACTOR.md` / `README.md` erwähnen.

### C.2 Code-Qualität

4. **Clean Code**: sprechende Namen, kurze Funktionen, wenig Duplikat; Magic Numbers in `WS.CONFIG` oder lokale benannte Konstanten.
5. **Modular**: Neue Logik in passende Datei unter `js/`; keine monolithische Wachstum von `game.js` ohne Struktur — bei Bedarf weitere Module und `REFACTOR.md` aktualisieren.
6. **Konsistenz**: Stil der bestehenden Dateien übernehmen (Einrückung, Kommentar-Dichte, Sprache der UI-Strings).

### C.3 Tests & Lieferung

7. **Immer testen**, was technisch möglich ist: Spiel lokal per HTTP-Server starten, Konsolen-Fehler prüfen, Kern-Steuerung (Pointer Lock, WASD, Sprung, Viewer-Modus, Tag/Nacht) kurz verifizieren.
8. **Keine bekannten Regressions** liefern; wenn unvermeidbar — im Protokoll dokumentieren und Abhilfe skizzieren.

### C.4 Dokumentation & Protokoll

9. **Jede abgeschlossene Arbeit** mit Eintrag in **Teil B** dieses Dokuments versehen (Datum, Signatur, Was, Warum).
10. **Architektur- oder Refactor-Entscheidungen** in `REFACTOR.md` pflegen, wenn sie über einen Einzeiler im Protokoll hinausgehen.

### C.5 Assets & Dependencies

11. **Keine großen Binärdateien** ohne Absprache hinzufügen; Lizenzen von Assets beachten.
12. **CDN-Versionen** von Three.js nur gezielt anheben und im Protokoll + `REFACTOR.md` begründen.

### C.6 Sicherheit & Hygiene

13. Keine Secrets, Tokens oder persönlichen Daten ins Repo committen.
14. Keine unnötigen `console.log` in Produktionspfaden — Debug-Logs nach Bedarf entfernen oder hinter sinnvollem Flag (künftig).

---

## Teil D — Kurz-Checkliste vor Merge / vor Abschluss eines Agent-Laufs

- [ ] Protokolleintrag in Teil B ergänzt  
- [ ] `REFACTOR.md` aktualisiert, falls Architektur/Phasen betroffen  
- [ ] Lokal smoke-getestet (Server + Browser)  
- [ ] Keine offensichtlichen Linter-/Syntaxfehler in geänderten Dateien  

---

*Verantwortlich für Pflege: Projektlead bzw. der jeweils beauftragte Agent mit Review durch Human.*
