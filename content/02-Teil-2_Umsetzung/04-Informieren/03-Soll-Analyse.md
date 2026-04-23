---
title: "Soll-Analyse"
description: ""
weight: 3
pdfSectionId: "soll-analyse"
---

## Zielbild

Das Ziel der IPA ist es, die sicherheitsrelevanten Daten aus {{< glossary "Cortex Cloud" >}} in das bestehende SDX-Frontend-Gerüst zu integrieren und es damit produktiv nutzbar zu machen. Kunden sollen ihre Sicherheitslage über einen einzigen, zentralen Kanal einsehen können, ohne zwischen verschiedenen Tools wechseln zu müssen.

Der Soll-Zustand lässt sich in drei Ebenen beschreiben, mit einem optionalen vierten Aspekt:

1. **Datenebene**: {{< glossary "EQL" >}}-Abfragen auf dem {{< glossary "Elasticsearch" >}}-Cluster filtern die relevanten Security-Events aus Cortex Cloud und fassen sie zu aussagekräftigen Metriken zusammen. {{< ref "elastic_eql_docs" "Elastic EQL Dokumentation" >}}
2. **Logikebene**: Eine {{< glossary "TypeScript" >}}-Applikation führt die EQL-Abfragen dynamisch aus, verarbeitet die Rückgabedaten und stellt sie über definierte Schnittstellen bereit.
3. **Präsentationsebene**: Das SDX-Frontend-Gerüst ruft die Daten über die Schnittstellen ab und stellt sie im {{< glossary "Swisscom SDX" >}}-Design dar.
4. **Export (optional)**: Falls Zeit und Umfang es erlauben, soll ein automatischer PDF-Export des Reports ermöglicht werden, damit Kunden einen formatierten Bericht ihrer Sicherheitslage herunterladen können.

## Datenfluss (Soll)

{{< diagram caption="Soll-Datenfluss: Von Cortex Cloud zum SDX-Frontend" id="soll-datenfluss" >}}
flowchart LR
    A["Cortex Cloud"] -->|"Events"| B["Elasticsearch"]
    B -->|"EQL-Abfragen"| C["TypeScript-Backend"]
    C -->|"API-Schnittstellen"| D["SDX-Frontend"]
    D -->|"Ansicht"| E["Kunde"]
{{< /diagram >}}

## Abgrenzung

Die Soll-Analyse deckt ausschliesslich die Integration der Cortex-Cloud-Daten in die bestehende Infrastruktur ab. Folgendes ist nicht Teil der Arbeit:

- Strukturelle Änderungen am SDX-Frontend-Gerüst ausserhalb der Cortex-Datenintegration
- Konfiguration oder Anpassung der Cortex-Cloud-Instanz selbst
- Neue Cortex-Cloud-Regeln oder Posture-Definitionen

{{< ref "pkorg_detaillierte_aufgabenstellung_2026" "Aufgabenstellung" >}}

## Qualitätssicherung

Die Korrektheit der EQL-Abfrageergebnisse wird durch einen systematischen Soll-Ist-Vergleich mit den Rohdaten aus Cortex Cloud nachgewiesen. Jeder Abgleich wird mit Screenshots der Test-Queries in {{< glossary "Kibana" >}} dokumentiert.

{{< ki >}}
