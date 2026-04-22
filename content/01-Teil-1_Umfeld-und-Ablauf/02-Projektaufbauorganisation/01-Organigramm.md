---
title: "Projektorganigramm"
description: ""
weight: 1
---

Das Organigramm zeigt die Rollen im Projekt sowie die wichtigsten Kommunikations- und Abstimmungsbeziehungen zwischen Kandidat, Fachrollen und Experten.

{{< diagram caption="Projektaufbauorganisation" id="projektaufbauorganisation" >}}
flowchart TB
    subgraph PKORG
        Hauptexperte["Hauptexperte<br/>{{< param "hauptexperte.name" >}}"]
        Nebenexperte["Nebenexperte<br/>{{< param "nebenexperte.name" >}}"]

    end

    subgraph {{< param "autor.firma" >}}
        subgraph {{< param "autor.abteilung" >}}
            VerantwortlicheFachkraft["Verantwortliche Fachkraft<br/>{{< param "verantwortlicheFachkraft.name" >}}"]
            FachlicheUnterstuetzung["Fachliche Unterstützung<br/>{{< param "fachlicheUnterstuetzung.name" >}}"]
        end

        Projektleiter["Projektleiter<br/>{{< param "autor.name" >}}"]
        Entwickler["Entwickler<br/>{{< param "autor.name" >}}"]
        Testverantwortlicher["Testverantwortlicher<br/>{{< param "autor.name" >}}"]
    end
    VerantwortlicheFachkraft --- Projektleiter
    FachlicheUnterstuetzung --- Projektleiter
    VerantwortlicheFachkraft --- Hauptexperte
    Projektleiter --- Entwickler
    Projektleiter --- Testverantwortlicher
    Hauptexperte --- Projektleiter
    Nebenexperte --- Hauptexperte
{{< /diagram >}}

