# IPA Qualitaetsleitfaden fuer kuenftige Agents

Ziel dieser Datei: Schnell verstehen, was eine starke IPA-Dokumentation ausmacht, welche Kapitel zwingend reinmuessen und wie sie geschrieben sein sollen.

Grundlage:
- `Examples/IPA_Benjamin_Scheibler.pdf`
- `Examples/IPA-Isaac-Manuel-Lins.pdf`
- `Context Window` (inkl. Kriterien I1-I7 und A1-C10)

## 1) Was beide guten Beispiele gemeinsam machen

1. Sie haben einen klaren, reproduzierbaren Aufbau von Anfang bis Ende.
2. Sie trennen **Teil 1 (Umfeld/Ablauf)** und **Teil 2 (Projektumsetzung)** sauber.
3. Sie dokumentieren Entscheidungen und Tests nachvollziehbar (nicht nur Ergebnis zeigen).
4. Sie zeigen den roten Faden: Ausgangslage -> Anforderungen -> Planung -> Umsetzung -> Kontrolle -> Auswertung.
5. Sie liefern Belege (Tabellen, Testfaelle, Journaleintraege, Quellen, Anhang).

## 2) Mindeststruktur, die in der IPA drin sein muss

Diese Struktur ist fuer kuenftige Agents als Standard zu verwenden.

### Teil 1: Umfeld und Ablauf
- Zielgruppe / Voraussetzungen an Leser
- Aufgabenstellung (Ausgangslage, detaillierte Aufgabenstellung)
- Vorkenntnisse, Vorarbeiten, neue Lerninhalte
- Firmenstandards (Dokumentation, Coding, Testing, Team-Konventionen)
- Projektorganisation (Personen, Rollen, Organigramm, Kommunikation)
- Arbeitsorganisation (Arbeitsplatz, Datensicherung, Rapportierung)
- Zeitplan mit Soll/Ist
- Arbeitsjournal pro Tag
- Persoenliches Fazit / Reflexion

### Teil 2: Projekt-Dokumentation / Umsetzung
- Kurzfassung (max. eine A4-Seite ohne Grafik)
- Projektmethode (z. B. IPERKA) und warum sie passt
- Abgrenzung (was ist explizit drin, was ist nicht drin)
- Informieren (Ist/Soll, Anforderungen, Datenquellen)
- Planen (Architektur, Testkonzept, Datenmodell, Schnittstellen)
- Entscheiden (Varianten, Kriterien, Entscheidungsmatrix, begruendete Wahl)
- Realisieren (Setup, Implementierung, zentrale Komponenten)
- Kontrollieren (Testdurchfuehrung, Resultate, Abweichungen)
- Auswerten (Zielerreichung, Grenzen, Verbesserungen, Gesamtbeurteilung)
- Verzeichnisse (Quellen, Glossar, Abbildungen, Tabellen)
- Anhang (Quellcode, Commit-Historie, weitere Nachweise)

## 3) Wie Kapitel geschrieben werden sollen (wichtig fuer Bewertung)

### Aufgabenstellung / Anforderungen
- Anforderungen als pruefbare Punkte schreiben (messbar, eindeutig).
- Nicht nur "soll gut sein", sondern konkrete Kriterien und erwartete Resultate.
- Harte und weiche Bedingungen trennen, falls relevant.

### Planung / Konzeption
- Architektur und Datenfluss mit einfacher, klarer Logik beschreiben.
- Testkonzept vor der Umsetzung dokumentieren.
- Varianten und Entscheidungen mit Kriterien begruenden (Matrix oder klare Tabelle).

### Umsetzung
- Nur relevante Implementierungsdetails zeigen.
- Fokus auf Nachvollziehbarkeit: warum diese Loesung, nicht nur was gebaut wurde.
- Schnittstellen, Module und zentrale Funktionen sauber erklaeren.

### Testen / Kontrolle
- Testfaelle mit: Ziel, Input, erwartetes Ergebnis, effektives Ergebnis, Fazit.
- Abweichungen offen dokumentieren und erklaeren.
- Reproduzierbarkeit sicherstellen (Umgebung, Daten, Schritte).

### Auswertung / Reflexion
- Zielerreichung ehrlich beurteilen (inkl. nicht erreichte Punkte).
- Grenzen und offene Punkte klar benennen.
- Konkrete Verbesserungen nennen (keine leeren Floskeln).

## 4) Schreibstil-Regeln fuer kuenftige Agents

Diese Regeln direkt aus den vorhandenen Vorgaben ableiten:

- KISS: kurze, klare Saetze; kein unnoetig komplizierter Stil.
- Keine unnoetigen Zusatzfeatures in Inhalt oder Struktur.
- Direkt und menschlich schreiben, kein aufgeblasener Firmenstil.
- Adjektive sparsam einsetzen.
- Moeglichst keine Worthuelsen wie:
  - "systematisch"
  - "uebersichtlich"
  - "komplex"
  - "vollstaendig"
  - "zielgerichtet"
- Fachbegriffe korrekt verwenden und bei Bedarf kurz erklaeren.
- Pro Kapitel klarer Zweck: Was beantwortet dieses Kapitel?

## 5) Direkte Zuordnung zu den Bewertungskriterien (Checkliste)

Beim Schreiben immer gegen diese Punkte pruefen:

- A1/A3: Projektmethode + Zeitplan inkl. Soll/Ist sichtbar.
- A4/A5: Konzepte, Systemgrenzen und Schnittstellen dokumentiert.
- A6/B10: Testkonzept + Testdurchfuehrung + Auswertung vorhanden.
- A12: Versionierung und Datensicherung nachvollziehbar beschrieben.
- B1: Kurzfassung mit Ausgangslage, Umsetzung, Ergebnis.
- B2: Arbeitsjournal taeglich und mit Problemen/Hilfen.
- B3: Kritische Reflexion und persoenliche Bilanz enthalten.
- B4/B5: Klare Gliederung und praegnante Kapitel.
- B6-B9: Formale Vollstaendigkeit, saubere Darstellung, sinnvolle Abbildungen.
- I3/I7: Firmenstandards und Coding-/Dokumentationsstandards eingehalten.

## 6) Arbeitsmodus fuer kuenftige Agents (praktisch)

1. Zuerst Kapitelstruktur fixieren (vor Textproduktion).
2. Dann pro Kapitel 3-5 Kernfragen definieren, die beantwortet werden muessen.
3. Erst danach Text schreiben; am Schluss gegen Kriterien-Checkliste pruefen.
4. Vor Abgabe: Quellen, Glossar, Anhang, Journaleintraege und Testbelege auf Luecken pruefen.

## 7) Kurzvorlage fuer ein neues Kapitel

Fuer jedes neue Kapitel dieses Mini-Schema verwenden:

- Zweck des Kapitels (1-2 Saetze)
- Ausgangspunkt / Input
- Vorgehen
- Ergebnis
- Nachweis (Tabelle, Testfall, Screenshot, Quelle)
- Kurzes Teilfazit

So bleibt die IPA fuer Experten schnell pruefbar und fuer Dritte reproduzierbar.
