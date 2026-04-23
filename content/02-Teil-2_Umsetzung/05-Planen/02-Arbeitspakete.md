---
title: "Arbeitspakete"
description: ""
weight: 2
pdfSectionId: "arbeitspakete"
---

Die Anforderungen aus dem Anforderungskatalog werden in Arbeitspakete (AP) aufgeteilt. Jedes Arbeitspaket entspricht einem abgrenzbaren Arbeitsschritt mit einem klar definierten Ergebnis. Die Arbeitspakete bilden die Grundlage für die Aufgaben in Jira und den Zeitplan.

## Arbeitspakete-Übersicht

{{< table "Arbeitspakete" >}}

| ID | Titel | Beschreibung | Zugehörige Anforderungen | Aufwand (h) |
| :-- | :-- | :-- | :-- | :--: |
| AP-01 | Elasticsearch-Verbindung aufsetzen | Cortex-Cloud-Forwarding konfigurieren und Verbindung zu einem eigenen Elasticsearch-Cluster herstellen. Erste Events indexieren und Erreichbarkeit in Kibana bestätigen. | FA-01 | 8 |
| AP-02 | EQL-Abfragen entwickeln | Relevante Security-Metriken in Kibana identifizieren und als EQL-Abfragen formalisieren. Abfragen gegen Cortex-Rohdaten testen und in Kibana dokumentieren. | FA-02, FA-07 | 12 |
| AP-03 | TypeScript-Backend implementieren | Applikationslogik aufsetzen, die EQL-Abfragen dynamisch ausführt und die Rückgabedaten verarbeitet. REST-API-Endpunkte definieren und implementieren. | FA-03, FA-04 | 16 |
| AP-04 | Frontend-Integration | SDX-Frontend-Gerüst mit den Cortex-Cloud-Daten befüllen. Datenanbindung über die definierten API-Endpunkte herstellen und Darstellung im SDX-Design sicherstellen. | FA-05, NFA-03 | 12 |
| AP-05 | Validierung und Soll-Ist-Vergleich | EQL-Abfrageergebnisse systematisch mit Cortex-Rohdaten abgleichen. Abweichungen dokumentieren, Screenshots der Test-Queries in Kibana erstellen. | FA-06 | 8 |
| AP-06 | Systemdokumentation | Datenfluss, TypeScript-Architektur und verwendete EQL-Snippets vollständig dokumentieren. Dokumentation muss Wartung und Erweiterung durch Dritte ermöglichen. | NFA-01, NFA-05, NFA-06 | 8 |
| AP-07 *(opt.)* | PDF-Export | Automatischen Export des angezeigten Reports als PDF implementieren. Nur bei verbleibendem Aufwand nach Abschluss aller Must-Anforderungen. | FA-08 | 8 |

{{< /table >}}

**Geplanter Gesamtaufwand (Must):** 64 Stunden
**Optionaler Zusatzaufwand (AP-07):** 8 Stunden

## Abhängigkeiten

Die Arbeitspakete bauen aufeinander auf und müssen in der angegebenen Reihenfolge abgearbeitet werden:

{{< diagram caption="Abhängigkeiten zwischen Arbeitspaketen" id="ap-abhaengigkeiten" >}}
flowchart LR
    AP01["AP-01\nES-Verbindung"] --> AP02["AP-02\nEQL-Abfragen"]
    AP02 --> AP03["AP-03\nTypeScript-Backend"]
    AP03 --> AP04["AP-04\nFrontend-Integration"]
    AP04 --> AP05["AP-05\nValidierung"]
    AP05 --> AP06["AP-06\nDokumentation"]
    AP04 -.->|"optional"| AP07["AP-07\nPDF-Export"]
{{< /diagram >}}

AP-06 (Dokumentation) wird begleitend zu allen anderen Paketen geführt, ist aber erst nach der Validierung vollständig abschliessbar.

{{< ki >}}
