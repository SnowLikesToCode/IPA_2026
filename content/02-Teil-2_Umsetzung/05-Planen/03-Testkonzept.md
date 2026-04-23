---
title: "Testkonzept"
description: ""
weight: 3
pdfSectionId: "testkonzept"
---

## Teststrategie

Das Testkonzept legt fest, was auf welche Weise geprüft wird und wie die Testergebnisse nachgewiesen werden. Da es sich um eine Integration mehrerer Schichten handelt, werden Tests auf verschiedenen Ebenen durchgeführt: von der Datenanbindung über die Backend-Logik bis zur Darstellung im Frontend.

Die Korrektheit der Ergebnisse wird primär durch Soll-Ist-Vergleiche mit den Cortex-Rohdaten belegt. Automatisierte Tests ergänzen dort, wo die Logik isoliert prüfbar ist.

## Testfälle

{{< table "Testfälle" >}}

| ID | Stufe | Was wird getestet | Wie wird getestet | Erwartetes Ergebnis | Nachweis |
| :-- | :-- | :-- | :-- | :-- | :-- |
| TP-01 | Integration | {{< glossary "Elasticsearch" >}}-Verbindung zu {{< glossary "Cortex Cloud" >}} | In {{< glossary "Kibana" >}} prüfen, ob Events aus Cortex Cloud im Index erscheinen | Events sind indexiert und in Kibana suchbar | Screenshot Kibana Index-Übersicht |
| TP-02 | Integration | {{< glossary "EQL" >}}-Abfragen liefern korrekte Ergebnisse | EQL-Abfrageergebnisse mit Cortex-Rohdaten abgleichen (Soll-Ist-Vergleich) | Metriken stimmen mit Rohdaten überein; keine Diskrepanzen | Screenshots der Test-Queries in Kibana |
| TP-03 | Einheit | {{< glossary "TypeScript" >}}-Datenverarbeitung | Unit-Tests für die Verarbeitungslogik; Eingabe: Mock-EQL-Response, Ausgabe: erwartetes DTO | Verarbeitete Daten entsprechen der definierten Struktur | Test-Output (Protokoll) |
| TP-04 | Integration | REST-API-Endpunkte | API-Endpunkte mit definierten Testparametern aufrufen und Antwortstruktur prüfen | Endpunkte antworten mit korrekter Datenstruktur und HTTP-Status 200 | API-Response-Screenshot oder Protokoll |
| TP-05 | System | Darstellung im SDX-Frontend | Seiten im Browser aufrufen und Daten gegen API-Antwort prüfen; SDX-Konformität visuell prüfen | Daten werden vollständig und korrekt im {{< glossary "Swisscom SDX" >}}-Design angezeigt | Screenshot des Frontends mit Daten |

{{< /table >}}

## Abgrenzung

Folgendes ist nicht Gegenstand des Testkonzepts:

- Performance-Tests und Lasttests unter realen Produktionsbedingungen
- Sicherheitstests der Cortex-Cloud-Instanz selbst
- Tests der SDX-Grundstruktur (das Gerüst ist Vorarbeit und gilt als gegeben)

## Testdokumentation

Die Ergebnisse aller Testfälle werden im Kontrollieren-Kapitel dieser Dokumentation festgehalten. Jeder Test wird mit einem Screenshot oder einem Protokollauszug belegt. Abweichungen vom erwarteten Ergebnis werden beschrieben und, sofern korrigiert, mit dem Korrekturmassnahmen-Nachweis versehen.

{{< ki >}}
