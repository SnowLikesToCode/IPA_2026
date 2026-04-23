---
title: "Ist-Analyse"
description: ""
weight: 1
pdfSectionId: "ist-analyse"
---

## Umfeld und bestehende Infrastruktur

Im Bereich Managed Security Services der Swisscom werden Security- und Compliance-Produkte für Grosskunden betrieben, primär im Bankensektor. Als Vorarbeit zu dieser IPA wurde ein Frontend-Gerüst auf Basis des {{< glossary "Swisscom SDX" >}}-Design-Systems aufgebaut. Es enthält das Swisscom-Branding (Logo, Layout, Navigation) und definiert damit die visuelle Grundstruktur der späteren Reporting-Seite – jedoch ohne Datenanbindung und ohne inhaltliche Befüllung.

Dieses Gerüst bildet den Ausgangspunkt der IPA. Es existiert, ist aber nicht produktiv nutzbar, solange keine echten Daten eingebunden sind. {{< ref "pkorg_detaillierte_aufgabenstellung_2026" "Aufgabenstellung" >}}

## Cortex Cloud

{{< glossary "Cortex Cloud" >}} ist ein KI-gestütztes Cloud-Security-Produkt von Palo Alto Networks und neu im Portfolio der Swisscom MSS. Es überwacht Cloud-Umgebungen auf Fehlkonfigurationen, Schwachstellen und sicherheitsrelevante Ereignisse und ist als {{< glossary "CNAPP" >}} konzipiert. {{< ref "cortex_cloud_docs" "Cortex Cloud Documentation" >}}

Eine Anbindung von Cortex Cloud an einen eigenen {{< glossary "Elasticsearch" >}}-Cluster besteht zum Zeitpunkt der IPA nicht. Sie muss im Rahmen dieser Arbeit neu aufgesetzt werden. Erst nach dem Aufbau der Verbindung können Security-Events in Elasticsearch indexiert und via {{< glossary "Kibana" >}} ausgewertet werden. {{< ref "elastic_elasticsearch_docs" "Elasticsearch Guide" >}}

## Aktueller Reportingprozess

Aktuell besteht kein automatisierter Weg, Cortex-Cloud-Daten im bestehenden Reporting-Frontend darzustellen. Für eine Übersicht ihrer Sicherheitslage in Cortex Cloud müssen Kunden direkt im nativen Cortex-Cloud-Dashboard nachschlagen. Dieses Dashboard ist nicht in die Swisscom-Infrastruktur eingebunden und nicht auf die Anforderungen des Swisscom-Betriebs zugeschnitten.

%%Screenshot des nativen Cortex-Cloud-Dashboards als Nachweis einfügen%%

## Technische Grundlage für EQL

{{< glossary "EQL" >}} (Event Query Language) ist die im Elastic Stack vorgesehene Abfragesprache für sequenzielle Ereignisanalysen. Sie ermöglicht es, zeitlich geordnete Event-Ketten abzufragen und sicherheitsrelevante Muster zu erkennen. {{< ref "elastic_eql_docs" "Elastic EQL Dokumentation" >}}

Die EQL-Abfragen werden in {{< glossary "Kibana" >}} entwickelt und getestet, bevor sie in die {{< glossary "TypeScript" >}}-Applikationslogik überführt werden.

{{< ki >}}
