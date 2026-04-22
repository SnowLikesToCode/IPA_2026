---
title: "Dokumentationsvorlage"
description: ""
weight: 1
---

Für diesen IPA-Bericht verwende ich eine technische Dokumentationsvorlage auf Basis von Markdown und Hugo. Als Grundlage dient die Vorlage von Isaac Lins aus dem Repository {{< ref "ipa_vorlage_github" "Individuelle-Praktische-Arbeit-Vorlage"  >}}, die ich für meine Arbeit angepasst habe.

Ich habe mich bewusst für diese Lösung entschieden, weil sie versionierbar, nachvollziehbar und im Arbeitsalltag deutlich angenehmer ist als ein klassisches Word-Dokument.

Die Vorlage nutzt Shortcodes, damit wiederkehrende Inhalte einheitlich und sauber gepflegt werden können. Beispiele in dieser Dokumentation:

- `param`: Zentrale Stammdaten (z.B. Name, Firma, Zeitraum) aus der Konfiguration einbinden
- `diagram`: Organigramme und Ablaufgrafiken direkt im Quelltext definieren
- `figure`: Abbildungen einheitlich beschriften und formatieren
- `glossary`: Fachbegriffe konsistent mit dem Glossar verlinken
- `ref`: Einheitliche Querverweise auf Kapitel, Abbildungen und Quellen
- `ki`: Inhalte kennzeichnen, die mit KI erstellt wurden
- `pagebreak`: Gezielte Seitenumbrüche für den PDF-Export setzen

Der Inhalt wird in Markdown-Dateien geschrieben. Mit {{< glossary "Hugo" >}} wird daraus automatisch das PDF erzeugt.

Dieser Workflow passt besser zu einer entwicklungsnahen Arbeitsweise und erlaubt eine strukturierte Pflege der Dokumentation. Deshalb wurde die Hugo-basierte Vorlage gegenüber Word bevorzugt.
