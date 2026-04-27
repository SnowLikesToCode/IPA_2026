---
title: "Lösungsvarianten"
description: ""
weight: 1
pdfSectionId: "loesungsvarianten"
---

## Ausgangslage

Für alle betrachteten Lösungsvarianten gilt dieselbe fachliche Grundannahme: Die sicherheitsrelevanten Daten aus {{< glossary "Cortex Cloud" >}} werden in {{< glossary "Elasticsearch" >}} verfügbar gemacht. Dieser Schritt ist gesetzt, weil die Auswertung mit {{< glossary "EQL" >}}, die Prüfung in {{< glossary "Kibana" >}} und der Soll-Ist-Vergleich auf dieser Datenbasis aufbauen.

Die Varianten unterscheiden sich deshalb nicht darin, ob Cortex-Cloud-Daten nach Elasticsearch gelangen, sondern wie die Datenübernahme technisch erfolgt und wie die ausgewerteten Ergebnisse anschliessend den Kunden zugänglich gemacht werden.

## Bewertete Varianten

{{< table "Vergleich der Lösungsvarianten" >}}

| Variante | Beschreibung | Vorteile | Nachteile | Bewertung |
| :-- | :-- | :-- | :-- | :-- |
| V1 | Cortex-Cloud-Daten werden über eine API abgeholt, in Elasticsearch abgelegt und anschliessend über eine Weboberfläche dargestellt. | Keine zusätzliche Logstash-Infrastruktur nötig; weniger Netzwerkfreigaben; Datenfluss bleibt im Projekt kontrollierbar; passt zur geplanten TypeScript-Verarbeitung und zur Webseite. | Ein Skript oder eine Applikationslogik muss regelmässig laufen, um Daten abzufangen beziehungsweise abzuholen und weiterzugeben. Das erhöht den Implementierungs- und Betriebsaufwand. | **Bevorzugte Variante** |
| V2 | Cortex-Cloud-Daten werden über Logstash nach Elasticsearch weitergeleitet und anschliessend über eine Weboberfläche dargestellt. | Logstash ist für Datenpipelines geeignet; Verarbeitung und Weiterleitung können zentral konfiguriert werden. | Es müssen Ports, Netzwerkfreigaben und Erreichbarkeiten geklärt werden. Dadurch entsteht zusätzlicher Abstimmungsaufwand mit Netzwerk- und Sicherheitsaspekten. | Fachlich möglich, aber für den IPA-Rahmen riskanter |
| V3 | Cortex-Cloud-Daten werden unabhängig von der konkreten Übertragungsart in Elasticsearch abgelegt, die Ausgabe erfolgt jedoch nicht über die Webseite, sondern zum Beispiel als PDF oder über eine andere Darstellung. | Die Ausgabe kann einfacher gehalten werden, wenn keine vollständige Frontend-Integration umgesetzt wird. | Der Kernauftrag der IPA, die Daten in das bestehende SDX-Frontend zu integrieren, wird nur unvollständig erfüllt. Die Benutzerführung und zentrale Sicht im Webinterface stehen nicht im Vordergrund. | Nicht geeignet als Hauptvariante |

{{< /table >}}

## Bewertungskriterien

Für die Entscheidung wurden folgende Kriterien verwendet:

- **Anforderungserfüllung**: Die Variante muss die Must-Anforderungen aus dem Anforderungskatalog abdecken.
- **Nachweisbarkeit**: Die Korrektheit der Daten muss über Soll-Ist-Vergleiche mit Cortex-Rohdaten belegbar sein.
- **Machbarkeit im IPA-Zeitrahmen**: Die Lösung muss innerhalb der verfügbaren Arbeitstage realistisch umsetzbar sein.
- **Wartbarkeit**: Die Lösung soll so dokumentiert und strukturiert sein, dass eine externe Fachperson sie nachvollziehen und erweitern kann.
- **Risiko**: Die Variante soll technische Abhängigkeiten und offene Punkte möglichst kontrollierbar halten.

## Entscheidungsmatrix

Die Varianten wurden mit einer Skala von 1 bis 5 bewertet. Der Wert 1 steht für eine geringe Eignung, der Wert 5 für eine sehr hohe Eignung. Beim Kriterium Risiko bedeutet eine höhere Zahl, dass das Risiko tiefer beziehungsweise besser kontrollierbar ist. Die Gewichtung zeigt, wie stark das jeweilige Kriterium in die Entscheidung einfliesst.

{{< table "Entscheidungsmatrix der Lösungsvarianten" >}}

| Kriterium | Gewichtung | V1: API + Elasticsearch + Weboberfläche | V2: Logstash + Elasticsearch + Weboberfläche | V3: Elasticsearch ohne Weboberfläche |
| :-- | --: | --: | --: | --: |
| Anforderungserfüllung | 30 % | 5 | 4 | 2 |
| Nachweisbarkeit | 20 % | 5 | 4 | 3 |
| Machbarkeit im IPA-Zeitrahmen | 20 % | 4 | 3 | 4 |
| Wartbarkeit | 15 % | 4 | 3 | 3 |
| Risiko (5 = tief / gut kontrollierbar) | 15 % | 4 | 2 | 3 |
| **Gewichtetes Ergebnis** | **100 %** | **4.50** | **3.35** | **2.85** |

{{< /table >}}

V1 erreicht das beste gewichtete Ergebnis. Ausschlaggebend sind die vollständige Erfüllung des Kernauftrags, die gute Nachweisbarkeit über Elasticsearch und Kibana sowie das im IPA-Zeitrahmen besser kontrollierbare Risiko.

## Fazit

V1 deckt die fachlichen und technischen Anforderungen am besten ab. Der Datenfluss über Cortex Cloud, Elasticsearch, TypeScript und Weboberfläche bleibt erhalten, ohne dass zusätzliche Netzwerkfreigaben für Logstash im Zentrum der Umsetzung stehen. Der Nachteil ist, dass ein Skript oder eine Applikationslogik für das Abholen und Weitergeben der Daten nötig ist. Dieser Aufwand ist im IPA-Rahmen besser kontrollierbar als die zusätzlichen Abhängigkeiten der Logstash-Variante.

{{< ki >}}
