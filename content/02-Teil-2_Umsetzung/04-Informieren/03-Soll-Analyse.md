---
title: "Soll-Analyse"
description: ""
weight: 3
pdfSectionId: "soll-analyse"
---

## Zielbild

Das Ziel der IPA ist es, die sicherheitsrelevanten Daten aus {{< glossary "Cortex Cloud" >}} in die bestehende Reporting-Webseite zu integrieren. Kunden sollen ihre Sicherheitslage über einen einzigen, zentralen Kanal einsehen können, ohne zwischen verschiedenen Tools wechseln zu müssen.

Der Soll-Zustand lässt sich in drei Ebenen beschreiben:

1. **Datenebene**: {{< glossary "EQL" >}}-Abfragen auf dem {{< glossary "Elasticsearch" >}}-Cluster filtern die relevanten Security-Events aus Cortex Cloud und fassen sie zu aussagekräftigen Metriken zusammen. {{< ref "elastic_eql_docs" "Elastic EQL Dokumentation" >}}
2. **Logikebene**: Eine {{< glossary "TypeScript" >}}-Applikation führt die EQL-Abfragen dynamisch aus, verarbeitet die Rückgabedaten und stellt sie über definierte Schnittstellen bereit.
3. **Präsentationsebene**: Das bestehende Web-Frontend ruft die Daten über die Schnittstellen ab und stellt sie im Swisscom-{{< glossary "Swisscom SDX" >}}-Design dar.

## Datenfluss (Soll)

{{< diagram caption="Soll-Datenfluss: Von Cortex Cloud zur Reporting-Webseite" id="soll-datenfluss" >}}
flowchart LR
    A["Cortex Cloud"] -->|"Events"| B["Elasticsearch"]
    B -->|"EQL-Abfragen"| C["TypeScript-Backend"]
    C -->|"API-Schnittstellen"| D["Reporting-Webseite"]
    D -->|"Ansicht"| E["Kunde"]
{{< /diagram >}}

## Abgrenzung

Die Soll-Analyse deckt ausschliesslich die Integration der Cortex-Cloud-Daten in die bestehende Infrastruktur ab. Folgendes ist nicht Teil der Arbeit:

- Änderungen an der bestehenden Reporting-Webseite ausserhalb der neuen Cortex-Ansicht
- Konfiguration oder Anpassung der Cortex-Cloud-Instanz selbst
- Neue Cortex-Cloud-Regeln oder Posture-Definitionen (diese wurden in den Vorarbeiten erstellt)

{{< ref "pkorg_detaillierte_aufgabenstellung_2026" "Aufgabenstellung" >}}

## Qualitätssicherung

Die Korrektheit der EQL-Abfrageergebnisse wird durch einen systematischen Soll-Ist-Vergleich mit den Rohdaten aus Cortex Cloud nachgewiesen. Jeder Abgleich wird mit Screenshots der Test-Queries in {{< glossary "Kibana" >}} dokumentiert.

{{< ki >}}
