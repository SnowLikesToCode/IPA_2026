---
title: "Dokumentationsvorlage"
description: ""
weight: 1
---

Für den vorliegenden IPA-Bericht wird eine eigens gepflegte technische Dokumentationsvorlage auf Basis von Markdown und Hugo eingesetzt. Die Vorlage basiert auf dem Repository {{< ref "ipa_vorlage_github" "Individuelle-Praktische-Arbeit-Vorlage"  >}}, das innerhalb weniger Tage für diesen Anwendungsfall aufgebaut wurde. Dieser Ansatz ermöglicht eine nachvollziehbare, versionierte und reproduzierbare Erstellung der Dokumentation.

Die Vorlage verwendet bewusst Shortcodes, um wiederkehrende Inhalte konsistent und wartbar abzubilden. Beispiele aus dieser Dokumentation sind:

- `param`: Einbindung zentraler Stammdaten (z.B. Name, Firma, Zeitraum) aus Konfigurationsdaten.
- `diagram`: Definition von Organigrammen bzw. Ablaufgrafiken direkt im Quelltext.
- `figure`: Einbindung von Abbildungen mit einheitlicher Beschriftung und Formatierung.
- `glossary`: Konsistente Verlinkung von Fachbegriffen zur Begriffserklärung.
- `ref`: Einheitliche Querverweise auf Kapitel, Abbildungen und externe Quellen.
- `ki`: KI-Markierung für den Inhalt, der mit KI erstellt wurde.
- `pagebreak`: Manueller Seitenumbruch für den PDF-Export via Browser-Print.

Der Inhalt wird in Markdown-Dateien geschrieben. Mit {{< glossary "Hugo" >}} entsteht daraus automatisch das PDF.
Die Entscheidung für diesen Aufbau wurde bewusst getroffen: Der Prüfungskandidat bevorzugt eine textbasierte, entwicklungsnahe Arbeitsweise gegenüber klassischen Office-Dokumenten. Statt in Word zu arbeiten, wurde ein technischer Workflow gewählt, der alternativ auch in Richtung {{< glossary "LaTeX" >}} denkbar wäre, hier jedoch durch ein eigenes, auf die IPA zugeschnittenes Framework umgesetzt wurde.
