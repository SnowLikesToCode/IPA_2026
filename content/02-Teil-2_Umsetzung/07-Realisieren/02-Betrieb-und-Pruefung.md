---
title: "Betrieb und technische Prüfung"
description: ""
weight: 2
pdfSectionId: "betrieb-und-pruefung"
---

## Start der lokalen Dienste

Nach der Installation wurden Elasticsearch und Kibana über systemd gestartet. Dadurch kann der Kandidat die lokale Entwicklungsumgebung reproduzierbar hochfahren und den Zustand der Dienste prüfen.

```bash
sudo systemctl start elasticsearch.service
sudo systemctl start kibana.service
```

Für die Kontrolle des Dienstzustands werden die systemd-Statusbefehle verwendet.

```bash
sudo systemctl status elasticsearch.service
sudo systemctl status kibana.service
```

Bei Bedarf können die Dienste wieder gestoppt werden.

```bash
sudo systemctl stop kibana.service
sudo systemctl stop elasticsearch.service
```

{{< ki >}}

## Technische Erreichbarkeitsprüfung

Die lokale Erreichbarkeit wurde über HTTP-Abfragen geprüft. Elasticsearch muss auf dem lokalen Port `9200` antworten. Kibana wird über die Status-API auf Port `5601` geprüft.

```bash
curl http://127.0.0.1:9200
curl http://127.0.0.1:5601/api/status
```

{{< table "Erreichbarkeitsprüfung der lokalen Dienste" >}}

| Dienst | Prüfbefehl | Erwartetes Ergebnis |
| :-- | :-- | :-- |
| Elasticsearch | `curl http://127.0.0.1:9200` | Elasticsearch antwortet mit Clusterinformationen |
| Kibana | `curl http://127.0.0.1:5601/api/status` | Der Status enthält `available` |
| systemd Elasticsearch | `systemctl is-active elasticsearch.service` | Ausgabe `active` |
| systemd Kibana | `systemctl is-active kibana.service` | Ausgabe `active` |

{{< /table >}}

Diese Prüfung ist noch kein fachlicher Test der späteren Cortex-Cloud-Daten. Sie bestätigt nur, dass die lokale technische Basis lauffähig ist und für die nächsten Umsetzungsschritte verwendet werden kann.

{{< ki >}}

## Lokaler Dokumentationsserver

Parallel zur technischen Umgebung wurde der Hugo-Entwicklungsserver gestartet. Damit kann der Kandidat die Dokumentation während der Realisierung laufend prüfen.

```powershell
hugo server --bind 0.0.0.0 --baseURL http://localhost:1313/ipa/ --buildFuture
```

Die lokale Dokumentation ist danach unter `http://localhost:1313/ipa/` erreichbar. Der Parameter `--buildFuture` ist notwendig, weil die IPA-Dokumentation Arbeitsjournal-Seiten mit zukünftigen Datumsangaben enthält.

{{< ki >}}

## Abgrenzung

Die bisherige Prüfung weist nur nach, dass die lokale WSL-Umgebung, Elasticsearch, Kibana und Hugo gestartet werden können. Sie belegt noch nicht, dass Cortex-Cloud-Daten korrekt importiert, indexiert oder fachlich ausgewertet werden. Diese Punkte müssen in den nächsten Realisierungsschritten separat dokumentiert und später im Testteil validiert werden.

Offen sind insbesondere:

- die lokale Konfiguration der Cortex-API-Zugangsdaten in der `.env`-Datei
- die Bestätigung der benötigten Cortex-Cloud-API-Endpunkte
- der erste Import von Rohdaten nach Elasticsearch
- die Auswertung der importierten Daten mit EQL
- der Soll-Ist-Vergleich gegen die Rohdaten

{{< ki >}}
