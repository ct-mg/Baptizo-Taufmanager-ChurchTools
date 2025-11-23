# PROJEKT-PLAN: Baptizo Taufmanager (ChurchTools Extension)

## 1. DEINE ROLLE & BASIS
Du bist ein Senior ChurchTools Extension Developer.
Deine technische Basis ist die Datei `skill.md` in diesem Ordner. Halte dich strikt an die dort beschriebenen Standards (Boilerplate, Manifest, Entry Points).

## 2. TECHNISCHE ANWEISUNGEN (STRIKT BEFOLGEN!)
Diese Regeln sind obligatorisch für den gesamten Entwicklungsprozess:

### Einrichtung & Workflow
- [ ] **Initiale Einrichtung:** Erstelle `.env` und `manifest.json` SCHRITT FÜR SCHRITT. Stelle mir Frage für Frage, um nichts zu vergessen. Warte nach jeder Frage auf meine Antwort.
- [ ] **Tasks & Pläne:** Speichere alle Tasks und Implementation Plans immer als Dateien im Ordner `/docs` (Antigravity Arbeitsweise).
- [ ] **Commits:** Führe nach jedem relevanten, abgeschlossenen Punkt einen Git Commit durch.

### Code & Architektur
- [ ] **Übersetzung (i18n):** Denke von Anfang an Mehrsprachigkeit mit (keine hartcodierten Texte).
- [ ] **Rollen & Rechte:** Definiere klar, wer was darf (Admin vs. User).
- [ ] **Daten-Handling:**
    - Daten sollen `onLoad` direkt gezogen werden.
    - Baue an relevanten Stellen zusätzlich manuelle **Refresh-Buttons** ein.
- [ ] **Save State (Dirty State):** Implementiere Warnungen: Der Browser/Tab darf nicht geschlossen werden, wenn ungespeicherte Daten vorliegen.

### UI & Design
- [ ] **Look & Feel:** UI muss zwingend **Dark-Mode** unterstützen.
- [ ] **Icons:** Nutze KEINE Emojis. Arbeite mit cleanen SVGs (z.B. Heroicons).
- [ ] **Stil:** Professionell, passend zu ChurchTools.

### Dokumentation (Pflicht!)
Erstelle sofort den Ordner `/docs` und lege folgende Dateien an (und pflege sie fortlaufend):
- `ARCHITECTURE.md`
- `IMPLEMENTATION_PLAN.md`
- `KNOWN-ISSUE.md`
- `MAINTENANCE.md`
- `PROJECT-OVERVIEW.md`
- `README.md`
- `TODO.md`
- `USER-REQUIREMENTS.md` (Hier kommt das Detail-Konzept rein)

---

## 3. PROJEKT-KONTEXT & MVP (Das bauen wir)

**Name:** Baptizo Taufmanager
**Ziel:** Ein Prozess-Tool für Taufen in ChurchTools. Es dient gleichzeitig als dezentes Branding für den Taufbecken-Hersteller "Baptizo".

**Kern-Logik (Die 2-Gruppen-Strategie):**
Wir bilden den Prozess über zwei Status-Gruppen ab:
1.  **Gruppe "Taufinteressenten":** Alles VOR der Taufe (Anmeldung, Seminar, Vorab-Mails).
2.  **Gruppe "Getaufte":** Alles NACH der Taufe (Urkunde, Kleingruppe, Nachsorge).

**Features (MVP):**
1.  **Dashboard:** Zeigt Statistiken (Drop-off Rate, fehlende Urkunden).
2.  **Automation:**
    - Mail 5 Tage VOR Taufe (Erinnerung/Infos).
    - Mail 5 Tage NACH Taufe (Glückwunsch).
3.  **Branding:** "Powered by Baptizo" im Footer und auf der Info-Seite.

---

## 4. DEIN ERSTER AUFTRAG (START)
1.  Lies diesen Plan und die `skill.md`.
2.  Erstelle die Ordnerstruktur für `/docs`.
3.  Schreibe basierend auf Punkt 3 (Projekt-Kontext) eine detaillierte `docs/USER-REQUIREMENTS.md`.
4.  Beginne DANACH mit dem Interview für die initiale Einrichtung (`manifest.json` etc.).

Antworte kurz, dass du bereit bist, und starte dann.