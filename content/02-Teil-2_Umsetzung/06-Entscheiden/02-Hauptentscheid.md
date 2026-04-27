---
title: "Hauptentscheid"
description: ""
weight: 2
pdfSectionId: "hauptentscheid"
---

## Entscheid

Der Kandidat entscheidet sich für Variante V1: Die Daten aus {{< glossary "Cortex Cloud" >}} werden über eine API abgeholt, in {{< glossary "Elasticsearch" >}} abgelegt und danach über die geplante Weboberfläche dargestellt. Elasticsearch bleibt dabei in jedem Fall die zentrale Datenbasis für die EQL-Auswertung und den Soll-Ist-Vergleich.

Die Variante mit Logstash wird nicht als Hauptweg gewählt, weil sie zusätzliche Netzwerk- und Portfreigaben benötigt. Die Variante ohne Weboberfläche wird ebenfalls verworfen, weil sie den Kernauftrag der IPA, die Cortex-Cloud-Daten in das bestehende SDX-Frontend zu integrieren, zu wenig erfüllt.

## Begründung

Diese Variante erfüllt die zentralen Anforderungen der IPA am besten. Die Aufgabenstellung verlangt eine Integration der Cortex-Cloud-Daten in das bestehende Reporting-Frontend, eine Verarbeitung mit TypeScript und einen Soll-Ist-Vergleich gegen die Rohdaten. Mit Elasticsearch und EQL kann der Kandidat die Security-Events strukturiert auswerten und die Resultate in Kibana nachvollziehbar prüfen.

Die Entscheidung stützt sich auf die Entscheidungsmatrix aus dem Variantenvergleich. V1 erreicht mit 4.50 Punkten das beste gewichtete Ergebnis. Ausschlaggebend sind vor allem die vollständige Erfüllung des Kernauftrags, die gute Nachweisbarkeit über Elasticsearch und Kibana sowie das kontrollierbare Risiko im IPA-Zeitrahmen.

Der API-Ansatz ist zwar aufwendiger, weil ein Skript oder eine Applikationslogik für das Abholen und Weitergeben der Daten betrieben werden muss. Dieser Aufwand liegt jedoch näher am eigentlichen Projektziel als die Logstash-Variante, bei der Netzwerkfreigaben, Ports und zusätzliche Infrastrukturfragen stärker in den Vordergrund rücken würden.

Die getrennten API-Endpunkte pro Kernmetrik werden beibehalten, weil sie die Umsetzung übersichtlich machen. Jede Metrik kann separat entwickelt, getestet und gegen die Rohdaten validiert werden. Dadurch bleibt klar erkennbar, welcher Teil des Datenflusses für welches Ergebnis verantwortlich ist.

## Konsequenzen für die Umsetzung

Aus dem Entscheid ergeben sich folgende Umsetzungspunkte:

- Die Datenübernahme von Cortex Cloud nach Elasticsearch wird über einen API-basierten Ansatz vorbereitet.
- Das benötigte Skript oder die Applikationslogik zum Abholen und Weitergeben der Daten muss zuverlässig ausgeführt und dokumentiert werden.
- EQL-Abfragen werden zuerst in Kibana geprüft, bevor sie in die TypeScript-Schicht übernommen werden.
- Die TypeScript-Schicht stellt getrennte API-Endpunkte für die geplanten Kernmetriken bereit.
- Die Frontend-Integration erfolgt erst, wenn die API-Antworten fachlich nachvollziehbar sind.
- Der Soll-Ist-Vergleich wird pro Metrik dokumentiert, damit Fehlerquellen eingegrenzt werden können.

## Grenzen des Entscheids

Der Entscheid legt den technischen Hauptpfad fest, ersetzt aber noch nicht die Detailarbeit der Realisierung. Insbesondere die finalen API-Aufrufe, Event-Felder, Filterbedingungen und Datenstrukturen können erst während der Arbeit mit den real verfügbaren Cortex-Cloud-Daten abschliessend präzisiert werden.

Falls der API-basierte Ansatz nicht wie geplant funktioniert, muss der Kandidat mit dem Berufsbildner prüfen, ob Logstash oder eine andere Datenübernahme als Ersatzweg realistisch ist. Dieser Fall ist eng mit den Risiken zur Datenanbindung und zum Zeitrahmen verbunden.

## Nächster Schritt

Als nächster Schritt beginnt die Realisierungsphase mit der technischen Vorbereitung des API-basierten Datenflusses. Dabei wird zuerst geprüft, wie Cortex-Cloud-Daten abgeholt, in Elasticsearch abgelegt und anschliessend für die EQL-Auswertung sichtbar gemacht werden können.

{{< ki >}}
