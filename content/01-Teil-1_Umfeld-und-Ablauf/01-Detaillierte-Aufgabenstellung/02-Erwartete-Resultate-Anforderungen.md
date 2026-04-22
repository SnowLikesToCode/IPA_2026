---
title: "Anforderungen"
description: "Beschreibung der Anforderungen"
weight: 2
---

## Detaillierte Aufgabenstellung

Für die Datengewinnung werden im Elastic-Stack (Elasticsearch und Kibana) EQL-Abfragen erstellt, um relevante Security-Events aus Cortex Cloud zu filtern und in Metriken umzuwandeln.

Die Applikationslogik wird in TypeScript umgesetzt. Sie führt die EQL-Abfragen dynamisch aus, verarbeitet die Rückgabedaten und stellt sie so bereit, dass das bestehende Web-Frontend sie über definierte Schnittstellen abrufen kann.

Zur Qualitätssicherung werden die Ergebnisse der EQL-Abfragen mit den Rohdaten aus Cortex Cloud abgeglichen. Der Soll-Ist-Vergleich wird dokumentiert, inklusive Test-Query-Nachweisen.

Zusätzlich wird eine Systemdokumentation erstellt, die Datenfluss, Architektur der TypeScript-Logik und die verwendeten EQL-Snippets festhält, damit Wartung und Erweiterung möglich bleiben.

