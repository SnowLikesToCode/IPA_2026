---
title: "Lösungskonzept"
description: ""
weight: 1
pdfSectionId: "loesungskonzept"
---

## Architekturübersicht

Das Lösungskonzept beschreibt, wie die in der Soll-Analyse definierten Ziele technisch umgesetzt werden. Die Lösung gliedert sich in drei aufeinander aufbauende Schichten, mit einem optionalen vierten Element.

{{< diagram caption="Geplante Systemarchitektur" id="architektur-soll" >}}
flowchart TD
    A["Cortex Cloud\n(Datenquelle)"] -->|"Security-Events\n(Forwarding)"| B["Elasticsearch\n(Indexierung)"]
    B -->|"EQL-Abfragen"| C["TypeScript-Backend\n(Applikationslogik)"]
    C -->|"REST API"| D["SDX-Frontend\n(Darstellung)"]
    D -->|"Ansicht"| E["Kunde"]
    C -.->|"optional"| F["PDF-Export"]
{{< /diagram >}}

## Schichten im Detail

### Schicht 1 – Datenanbindung (Elasticsearch)

{{< glossary "Cortex Cloud" >}} bietet eine Forwarding-Konfiguration, über die Security-Events an externe Systeme weitergeleitet werden können. {{< ref "cortex_cloud_docs" "Cortex Cloud Documentation" >}} Im Rahmen dieser Arbeit wird eine Verbindung zu einem eigenen {{< glossary "Elasticsearch" >}}-Cluster aufgesetzt, der die eingehenden Events indexiert. {{< ref "elastic_elasticsearch_docs" "Elasticsearch Guide" >}}

Nach dem Aufbau der Verbindung stehen die Events in Elasticsearch zur Abfrage bereit und können in {{< glossary "Kibana" >}} untersucht werden. {{< ref "elastic_kibana_docs" "Kibana Guide" >}}

### Schicht 2 – Datenverarbeitung (EQL und TypeScript)

{{< glossary "EQL" >}}-Abfragen filtern die indexierten Events nach den für Swisscom-Kunden relevanten Metriken. {{< ref "elastic_eql_docs" "Elastic EQL Dokumentation" >}} Die Abfragen werden zuerst in Kibana entwickelt und getestet, bevor sie in die {{< glossary "TypeScript" >}}-Applikationslogik überführt werden.

Die TypeScript-Schicht führt die EQL-Abfragen dynamisch aus, verarbeitet die Rückgabedaten und stellt sie über definierte REST-API-Endpunkte bereit. Jeder Endpunkt entspricht einem klar abgegrenzten Metrikkomplex (z. B. Posture-Übersicht, aktive Alerts).

### Schicht 3 – Darstellung (SDX-Frontend)

Das bestehende SDX-Frontend-Gerüst ruft die Daten über die REST-API-Endpunkte ab und stellt sie im {{< glossary "Swisscom SDX" >}}-Design dar. Das Gerüst enthält bereits Branding, Layout und Navigation; die Datenanbindung ist die eigentliche Aufgabe dieser IPA.

### Optional – PDF-Export

Falls Aufwand und Zeit es erlauben, wird ein automatischer Export des angezeigten Reports als PDF ermöglicht (FA-08). Dieser Punkt wird nur umgesetzt, wenn die Must-Anforderungen vollständig erfüllt sind.

## Begründung der Technologiewahl

Die gewählten Technologien sind durch die offizielle Aufgabenstellung vorgegeben {{< ref "pkorg_detaillierte_aufgabenstellung_2026" "Aufgabenstellung" >}} und entsprechen dem internen Technologieportfolio des Teams:

- **Elasticsearch / Kibana**: Für die Indexierung und Analyse von Security-Events ist der Elastic Stack die im Team etablierte und in der Aufgabenstellung explizit vorgesehene Plattform.
- **EQL**: Die Abfragesprache des Elastic Stack für sequenzielle Ereignisanalysen. Grundkenntnisse sind als Vorkenntnisse deklariert.
- **TypeScript**: Bietet statische Typisierung und ist im Team für Backend-Logik etabliert.
- **Swisscom SDX**: Das interne Design-System ist Firmenvorgabe und nicht substituierbar.

{{< ki >}}
