# USER REQUIREMENTS: Baptizo Taufmanager (Final Master Specification)

## 1. PRODUKTVISION & ZIEL
Der "Baptizo Taufmanager" ist eine ChurchTools-Extension zur ganzheitlichen Verwaltung des Taufprozesses.
* **Strategie:** "Zero-Admin" durch intelligente Pool-Logik (keine manuelle Zuordnung zu Events).
* **Fokus:** Menschenbegleitung ("People Flow") statt reiner Ressourcenverwaltung.
* **Ziel:** Maximale Transparenz über den geistlichen Weg des Täuflings und Entlastung der Gemeindeleitung.

## 2. DATEN-ARCHITEKTUR
Das System basiert auf einer Zwei-Gruppen-Logik.
**WICHTIG:** Die Architektur muss mandantenfähig/Multi-Site sein (Standort/Distrikt-Filterung).

### 2.1 Gruppe: "Taufinteressenten" (Phase 1 - Der Pool)
* **Definition:** Eingangstor für ALLE Anmeldungen.
* **Input-Szenarien:** Vorab via Online-Formular ODER Live vor Ort (z.B. QR-Code Scan im Seminar).
* **Funktionsweise:** Dynamischer Pool.
    * Status `Aktiv`: Erhält Einladungen.
    * Status `Inaktiv`: Pausiert/Abgebrochen (keine Mails).
* **Datenfelder (Custom Fields):**
    * `seminar_besucht_am` (Datum): Dokumentiert die erfolgreiche Teilnahme.

### 2.2 Gruppe: "Getaufte" (Phase 2 - Alumni)
* **Definition:** Nachsorge & Integration.
* **Trigger:** Eintritt erfolgt NUR durch Bestätigung der Taufe ("Tauf-Vollzug").
* **Datenfelder (Custom Fields):**
    * `getauft_am` (Datum): Pflichtfeld bei Eintritt.
    * `urkunde_ueberreicht` (Boolean): Status der Papierarbeit.
    * `in_gemeinde_integriert` (Boolean): Wichtigste Metrik (Ist Person Teil einer Kleingruppe oder eines Dienstbereichs?).
    * `custom_flag` (Text/Boolean): Admin-konfigurierbares Feld (z.B. "Next Steps besucht").

## 3. EVENT-MANAGEMENT (Intern)
Die Extension verwaltet intern Events der Typen "Taufseminar" und "Taufe".
* **Serien:** Unterstützung für wiederkehrende Rhythmen (z.B. "Jeden 1. Sonntag im Monat, aber nicht im Januar").
* **Skip-Funktion:** Einfache Funktion, um einzelne Termine einer Serie zu löschen/überspringen.
* **Verantwortliche:** Zuordnung eines Leiters pro Event (für Reminder).

## 4. PROZESS-LOGIK (POOL-AUTOMATISIERUNG)
Es gibt KEINE manuelle Zuordnung von Personen zu Terminen. Das System "matcht" täglich den Pool gegen den Kalender.

### 4.1 Die Seminar-Schleife (Phase 1a)
Täglicher Check (CRON):
1.  **Event:** Findet in **3 Tagen** ein "Taufseminar" am Standort X statt?
2.  **Matching:** Finde alle Personen in "Taufinteressenten" (Standort X), die `Aktiv` sind UND Flag `seminar_besucht_am` NICHT haben.
3.  **Aktion:** Sende Einladungs-Mail ("Komm zum Seminar").
4.  **Loop:** Wer nicht kommt, bleibt im Pool und wird beim nächsten Termin erneut eingeladen (bis Erfolg oder Inaktiv-Setzung).
5.  **Abschluss:** Leiter markiert Anwesenheit -> System setzt Flag `seminar_besucht_am`.

### 4.2 Die Tauf-Schleife (Phase 1b)
Täglicher Check (CRON):
1.  **Event:** Findet in **5 Tagen** eine "Taufe" am Standort X statt?
2.  **Matching:** Finde alle Personen in "Taufinteressenten" (Standort X), die `Aktiv` sind UND Flag `seminar_besucht_am` HABEN.
3.  **Aktion:** Sende Tauf-Info-Mail (Vorbereitung, Kleidung, Treffpunkt).
4.  **Loop:** Wer sich nicht taufen lässt, bleibt im Pool für den nächsten Termin.

### 4.3 Der Tauf-Vollzug (Übergang)
Der einzige manuelle Schritt im Hauptprozess.
* **Aktion:** Pastor markiert Personen im Pool als "Jetzt getauft".
* **System:** Verschiebt Person in Gruppe "Getaufte" + setzt `getauft_am` = Heute.

## 5. KOMMUNIKATIONS-ENGINE (E-Mail)
Templates sind global anpassbar ("Voll individualisierbar auf Bedürfnisse der Kirche").

1.  **Pre-Seminar (3 Tage vor Event):**
    * *Inhalt:* Einladung, Ermutigung, Bibelvers.
    * *Ziel:* Alle im Pool ohne Seminar-Flag.
2.  **Pre-Taufe (5 Tage vor Event):**
    * *Inhalt:* Ermutigung, Bibelvers, Checkliste (Kleidung).
    * *Ziel:* Alle im Pool mit Seminar-Flag.
3.  **Post-Taufe Glückwunsch (5 Tage NACH `getauft_am`):**
    * *Inhalt:* "Willkommen in der Familie", Link zu Kleingruppen, **Link zu "Next-Steps" Infos**.
4.  **Follow-Up (30 Tage NACH `getauft_am`):**
    * *Inhalt:* Wertschätzung, Erinnerung an Taufe, Link zu Kleingruppen, **Link zu "Next-Steps" Infos**.
5.  **Leader-Reminder (1 Tag NACH Event):**
    * *Ziel:* Verantwortlicher Leiter des Events.
    * *Inhalt:* "Erinnerung: Bitte Gruppe pflegen (Anwesenheit/Taufen eintragen)."

## 6. REPORTING & DASHBOARD
Visualisierung (Charts) + PDF Export.
**WICHTIG:** Reporting muss sowohl über Einzel-Standorte als auch über die Gesamtkirche möglich sein.

### 6.1 Visuelle Metriken (Interaktiv)
* **Zeitachse:** Auswählbar (z.B. "Letztes Jahr").
* **Basis-Kurve:** "Anzahl Täuflinge" ist standardmäßig aktiviert.
* **Interaktion:** Per Klick können weitere Kurven eingeblendet werden ("Anzahl Interessenten", "Seminarbesucher").
* **KPIs:** Absolute Zahlen für JEDES Flag müssen als Übersicht angezeigt werden.
* **Vergleich:** Option "Vorjahresvergleich" einblendbar.

### 6.2 Spezialauswertungen (Listen & Analyse)
Hier müssen zwingend **Anzahl, Prozentsatz und Namensliste** ausgegeben werden.

1.  **Drop-Off-Analyse:**
    * *Logik:* Flag `hat_seminar_besucht` vorhanden, aber seit > 3 Monaten KEIN `getauft_am`.
    * *Anzeige:* Anzahl + %-Satz der Seminarbesucher, die abbrechen + Namensliste.
    * *Insight:* "Wo verlieren wir Leute? Stimmt die Qualität des Taufseminars?"
2.  **Urkunden-Check:**
    * *Logik:* Liste aller "Getauften" mit `urkunde_ueberreicht` = FALSE.
    * *Anzeige:* Namensliste der offenen Urkunden.
3.  **Integrations-Quote:**
    * *Logik:* Anzahl + %-Satz der Getauften mit `in_kleingruppe_integriert` = FALSE.
4.  **Custom-Flag Check:**
    * *Logik:* Auswertung nach dem benutzerdefinierten Flag (z.B. "Next Steps").

### 6.3 Der "Smart Report" (Automatisierte Tipps)
Ein dynamischer Text-Baustein, der konkrete Handlungsempfehlungen gibt.

* **Szenario A (Setup):** Wenn keine Follow-Up Mails aktiviert sind -> "Tipp: Richte Follow-Up Mails ein, um die Integration zu verbessern."
* **Szenario B (Lob):** Wenn > 90% aller Getauften integriert sind -> "Positiv: Über 90% Integration in die Gemeinde."
* **Szenario C (Problem-Erkennung):** Wenn Quote (Seminar -> Taufe) an Standort X < 50% ist -> "Verbesserungspotenzial: Am Standort X ist die Tauf-Quote unterdurchschnittlich."

### 6.4 Quartals-Push
Automatischer Versand eines Quartalsberichts (PDF) mit allen Kennzahlen an hinterlegte E-Mail-Adressen.

## 7. UI & BRANDING
* **Footer:** Dezent "Powered by Baptizo – Mobile Taufbecken" (Link öffnet www.baptizo.church).
* **Info-Page:** Reiter mit Vorstellung Baptizo Baptistries, Beschreibung des Dienstes und Integration der Webseite.
* **Constraint:** Keine Werbung in den E-Mails an die Täuflinge.

## 8. NICHT-FUNKTIONALE ANFORDERUNGEN
* **Design:** Zwingend Dark-Mode Support. Icons als SVG (keine Emojis).
* **Environment:** Entwicklung initial mit Mock-Daten (Read-Only auf `mgtest`).
