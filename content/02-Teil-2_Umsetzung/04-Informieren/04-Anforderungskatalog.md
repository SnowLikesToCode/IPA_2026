---
title: "Anforderungskatalog"
description: ""
weight: 4
pdfSectionId: "anforderungskatalog"
---

Die Anforderungen wurden aus der offiziellen Aufgabenstellung {{< ref "pkorg_detaillierte_aufgabenstellung_2026" "Aufgabenstellung" >}} und dem in der Informieren-Phase erarbeiteten Soll-Bild abgeleitet. Die Priorisierung erfolgt nach der {{< glossary "MoSCoW" >}}-Methode.

## Funktionale Anforderungen

{{< table "Funktionale Anforderungen" >}}

| ID | Anforderung | Priorität |
| :-- | :-- | :--: |
| FA-01 | Eine Verbindung zu {{< glossary "Elasticsearch" >}} und {{< glossary "Cortex Cloud" >}} wird aufgesetzt, sodass Security-Events in Elasticsearch indexiert werden. | Must |
| FA-02 | Abfragen mit {{< glossary "EQL" >}} filtern die relevanten Security-Events aus dem Elasticsearch-Cluster und liefern auswertbare Metriken. | Must |
| FA-03 | Die Applikationslogik in {{< glossary "TypeScript" >}} führt die EQL-Abfragen dynamisch aus und verarbeitet die Rückgabedaten. | Must |
| FA-04 | Die TypeScript-Logik stellt die verarbeiteten Daten über definierte API-Schnittstellen bereit. | Must |
| FA-05 | Das Frontend-Gerüst wird mit den Cortex-Cloud-Daten befüllt und stellt diese über die definierten Schnittstellen dar. | Must |
| FA-06 | Die Ergebnisse der EQL-Abfragen werden durch einen Soll-Ist-Vergleich mit den Cortex-Rohdaten validiert und mit Screenshots der Test-Queries in {{< glossary "Kibana" >}} dokumentiert. | Must |
| FA-07 | Die dargestellten Metriken bilden den aktuellen Sicherheitszustand der Kundeninfrastruktur ab. | Should |
| FA-08 | Der Report kann als PDF exportiert werden, sodass Kunden einen formatierten Bericht ihrer Sicherheitslage herunterladen können. | Could |

{{< /table >}}

## Nicht-funktionale Anforderungen

{{< table "Nicht-funktionale Anforderungen" >}}

| ID | Anforderung | Priorität |
| :-- | :-- | :--: |
| NFA-01 | Eine Systemdokumentation beschreibt den vollständigen Datenfluss, die TypeScript-Architektur und die verwendeten EQL-Snippets, damit das System wartbar und erweiterbar bleibt. | Must |
| NFA-02 | Der Code folgt den teaminternen Coding Guidelines. {{< ref "coding_guidelines" "Coding Guidelines" >}} | Must |
| NFA-03 | Die Darstellung im Frontend folgt den Vorgaben des Design-Systems {{< glossary "Swisscom SDX" >}}. | Must |
| NFA-04 | Der Quellcode ist via Git versioniert; die Aufgaben werden über Jira nachverfolgt. | Must |
| NFA-05 | Die API-Schnittstellen sind so dokumentiert, dass eine externe Fachperson damit weiterarbeiten kann. | Should |
| NFA-06 | Die EQL-Abfragen sind so strukturiert, dass sie unabhängig voneinander gewartet und erweitert werden können. | Should |

{{< /table >}}

## Randbedingungen

- Die Cortex-Cloud-Instanz selbst wird nicht inhaltlich verändert (keine neuen Regeln oder Posture-Definitionen).
- Das {{< glossary "Swisscom SDX" >}}-Frontend-Gerüst wird mit Cortex-Daten befüllt, aber nicht in seiner Grundstruktur umgebaut.

{{< ki >}}
