---
title: "Risikoanalyse"
description: ""
weight: 4
pdfSectionId: "risikoanalyse"
---

## Vorgehen

Die Risiken wurden auf Basis der Ist-Analyse und der Arbeitspakete identifiziert. Jedes Risiko wird nach Wahrscheinlichkeit und Auswirkung bewertet. Daraus ergibt sich die Risikostufe und die entsprechende Gegenmassnahme.

Bewertungsskala:
- **Wahrscheinlichkeit**: niedrig / mittel / hoch
- **Auswirkung**: niedrig / mittel / hoch
- **Risikostufe**: niedrig (grün) / mittel (gelb) / hoch (rot)

## Risikoregister

{{< table "Risikoregister" >}}

| ID | Risiko | Wahrscheinlichkeit | Auswirkung | Risikostufe | Gegenmassnahme |
| :-- | :-- | :--: | :--: | :--: | :-- |
| R-01 | Die {{< glossary "Elasticsearch" >}}-Verbindung zu {{< glossary "Cortex Cloud" >}} kann nicht aufgesetzt werden (fehlende Zugriffsrechte, Konfigurationsprobleme). | Mittel | Hoch | **Hoch** | Berufsbildner frühzeitig einbeziehen; Zugriffsberechtigung vorab klären. Falls Verbindung nicht herstellbar, Alternativansatz mit verfügbaren Cortex-Cloud-Export-APIs abklären. |
| R-02 | Der Aufwand für die {{< glossary "EQL" >}}-Abfragen wird unterschätzt; komplexe Korrelationen erfordern mehr Zeit als geplant. | Mittel | Mittel | **Mittel** | Mit einfachen Abfragen beginnen und schrittweise komplexer werden. Nicht zwingend benötigte Metriken (Should, Could) zuerst zurückstellen. |
| R-03 | Das Cortex-Cloud-Datenformat oder die Forwarding-API ändert sich während der IPA. | Niedrig | Hoch | **Mittel** | Dokumentation der verwendeten API-Version festhalten. Bei Änderungen sofort mit dem Berufsbildner besprechen. |
| R-04 | Das SDX-Frontend-Gerüst erlaubt keine direkte Anbindung der geplanten REST-API (technische Einschränkungen im bestehenden Stack). | Niedrig | Mittel | **Niedrig** | Technische Kompatibilität in AP-04 frühzeitig prüfen, bevor das Backend vollständig fertiggestellt ist. |
| R-05 | Der Zeitrahmen von 11 Arbeitstagen reicht nicht aus, um alle Must-Anforderungen vollständig zu erfüllen. | Mittel | Hoch | **Hoch** | Arbeitspakete sequenziell und strikt priorisiert abarbeiten. Optional-Pakete (AP-07) nur angehen, wenn Must-Pakete abgeschlossen sind. Tägliche Einschätzung des Fortschritts im Arbeitsjournal. |
| R-06 | Die Unit-Tests in TypeScript decken einen Fehler in der Verarbeitungslogik erst spät auf. | Niedrig | Mittel | **Niedrig** | Tests parallel zur Implementierung schreiben (testbegleitend). Nicht erst am Ende testen. |

{{< /table >}}

## Fazit

Die grössten Risiken liegen in der Erstverbindung zu {{< glossary "Elasticsearch" >}} (R-01) und im Zeitdruck bei der Gesamtdurchführung (R-05). Beide Risiken werden durch frühzeitige Kommunikation mit dem Berufsbildner und eine konsequente Must-first-Priorisierung adressiert.

{{< ki >}}
