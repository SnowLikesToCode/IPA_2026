---
title: "Schwachstellenanalyse"
description: ""
weight: 2
pdfSectionId: "schwachstellenanalyse"
---

Auf Basis der Ist-Analyse wurden die wesentlichen Schwachstellen des aktuellen Zustands identifiziert. Die Tabelle fasst sie zusammen und bewertet die Auswirkung auf den Betrieb und die Kundensicht.

{{< table "Schwachstellen des aktuellen Zustands" >}}

| ID | Schwachstelle | Auswirkung | Priorität |
| :-- | :-- | :-- | :--: |
| SW-01 | Die Cortex-Cloud-Daten sind nicht im SDX-Frontend-Gerüst integriert. | Kunden müssen für eine vollständige Sicherheitsübersicht zwischen mehreren Tools wechseln. | Hoch |
| SW-02 | Das native Cortex-Cloud-Dashboard ist nicht auf Swisscom-Kunden zugeschnitten. | Darstellung und Struktur passen nicht zur bestehenden Reporting-Landschaft; inkonsistentes Kundenerlebnis. | Hoch |
| SW-03 | Es existiert kein automatisierter Datenfluss von Cortex Cloud zum bestehenden Frontend. | Manuelle Auswertungen sind fehleranfällig, zeitaufwendig und nicht skalierbar. | Hoch |
| SW-04 | Es besteht keine Anbindung von Cortex Cloud an einen eigenen Elasticsearch-Cluster. | Ohne diese Verbindung sind keine EQL-Abfragen möglich; der gesamte Datenfluss fehlt. | Hoch |
| SW-05 | Es gibt keine formalisierten EQL-Abfragen auf Cortex-Cloud-Daten. | Ergebnisse sind nicht reproduzierbar und können nicht automatisiert weiterverarbeitet werden. | Mittel |
| SW-06 | Es gibt keine dokumentierten Schnittstellen zwischen den Cortex-Daten und dem Frontend. | Erweiterungen und Wartung sind ohne strukturierte API aufwendig. | Mittel |

{{< /table >}}

## Fazit

Die Schwachstellen zeigen, dass aktuell keine einzige Komponente des angestrebten Datenflusses in Betrieb ist. Es fehlt die {{< glossary "Elasticsearch" >}}-Anbindung an Cortex Cloud, es fehlen formalisierte {{< glossary "EQL" >}}-Abfragen, eine {{< glossary "TypeScript" >}}-Verarbeitungsschicht und definierte Schnittstellen zum Frontend-Gerüst.

Diese Lücken bilden direkt die Grundlage für die Soll-Analyse und den Anforderungskatalog.

{{< ki >}}
