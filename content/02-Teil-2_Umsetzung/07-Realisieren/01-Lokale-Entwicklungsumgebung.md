---
title: "Lokale Entwicklungsumgebung"
description: ""
weight: 1
pdfSectionId: "lokale-entwicklungsumgebung"
---

## Ziel der Umsetzung

Für die Realisierung wird zuerst eine lokale technische Grundlage aufgebaut. Der Kandidat benötigt eine Umgebung, in der die geplante Datenstrecke von {{< glossary "Cortex Cloud" >}} nach {{< glossary "Elasticsearch" >}} vorbereitet und später kontrolliert geprüft werden kann. Dafür wurde eine neue WSL-2-Umgebung mit Ubuntu eingerichtet und der Elastic Stack lokal installiert.

Die lokale Umgebung dient nicht als produktive Zielumgebung. Sie wird für Entwicklung, Nachvollziehbarkeit und erste technische Prüfungen verwendet. Dadurch können Konfigurationsfehler und Datenflussprobleme früh erkannt werden, bevor die weiteren Schritte mit realen Cortex-Cloud-Daten umgesetzt werden.

{{< ki >}}

## Umgesetzte Komponenten

{{< table "Lokale Komponenten der Realisierungsumgebung" >}}

| Komponente | Umsetzung | Zweck im Projekt |
| :-- | :-- | :-- |
| WSL 2 / Ubuntu | Ubuntu 24.04.4 LTS | Linux-basierte Entwicklungsumgebung auf dem Arbeitsgerät |
| systemd | Aktiviert und funktionsfähig | Starten, Stoppen und Prüfen der Dienste über `systemctl` |
| Elasticsearch | Version 8.19.14, lokal auf `127.0.0.1:9200` | Zielsystem für die Indexierung der späteren Cortex-Cloud-Daten |
| Kibana | Version 8.19.14, lokal auf `127.0.0.1:5601` | Sichtprüfung und spätere Entwicklung der EQL-Abfragen |
| Hugo | Lokaler Entwicklungsserver auf `localhost:1313/ipa/` | Laufende Kontrolle der IPA-Dokumentation |

{{< /table >}}

Die Dienste wurden so eingerichtet, dass sie über systemd gestartet und geprüft werden können. Elasticsearch und Kibana sind damit nicht nur manuell ausführbar, sondern als lokale Dienste nachvollziehbar betreibbar.

{{< ki >}}

## Konfiguration von Elasticsearch und Kibana

Elasticsearch wurde als lokale Single-Node-Instanz konfiguriert. Die Konfiguration bindet den Dienst bewusst nur an `127.0.0.1`, damit die Entwicklungsinstanz nicht im Netzwerk exponiert wird. Für die lokale Entwicklungsumgebung wurden Elastic-Security und TLS deaktiviert, weil der Fokus in dieser Phase auf dem Datenfluss und nicht auf produktionsnaher Zugriffssicherheit liegt.

```yaml
cluster.name: ipa-cortex-cloud-dev
node.name: wsl-dev-node
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 127.0.0.1
http.port: 9200
discovery.type: single-node
xpack.security.enabled: false
xpack.security.enrollment.enabled: false
xpack.security.http.ssl.enabled: false
xpack.security.transport.ssl.enabled: false
```

Kibana wurde ebenfalls lokal gebunden und auf die lokale Elasticsearch-Instanz ausgerichtet.

```yaml
server.host: "127.0.0.1"
server.port: 5601
elasticsearch.hosts: ["http://127.0.0.1:9200"]
```

Diese Konfiguration ist für die IPA-Entwicklung ausreichend, weil sie die spätere Indexierung und Analyse lokal vorbereitet. Für produktionsnahe Tests müsste die Sicherheitskonfiguration erneut bewertet und angepasst werden.

{{< ki >}}

## Technische Erkenntnisse aus der Einrichtung

Während der Einrichtung traten mehrere Probleme auf, die für die weitere Realisierung relevant sind. Ein Teil der Fehler entstand nicht durch Elasticsearch oder Kibana selbst, sondern durch die Kombination aus Windows PowerShell, WSL und Bash-Quoting. Deshalb wurden komplexe Einzeilenbefehle später vermieden und Konfigurationen kontrollierter über klar getrennte Schritte geschrieben.

Bei Elasticsearch zeigte sich ausserdem, dass eine zu stark reduzierte Konfiguration Paketpfade überschreiben kann. Ohne `path.data` und `path.logs` versuchte Elasticsearch, Logdaten unter `/usr/share/elasticsearch/logs` abzulegen und startete nicht. Zusätzlich mussten die automatisch vorhandenen TLS-Secure-Settings explizit entschärft werden, weil die lokale Entwicklungsumgebung ohne Security betrieben wird.

Kibana war direkt nach dem Start kurzzeitig noch nicht verfügbar. Dieses Verhalten wurde als normaler Startzustand bewertet, weil Kibana zuerst die Verbindung zu Elasticsearch und interne Plugin-Migrationen abschliessen muss. Die Prüfung wurde deshalb mit einer erneuten Statusabfrage wiederholt.

{{< ki >}}

## Ergebnis

Nach Abschluss der Einrichtung waren Elasticsearch und Kibana lokal erreichbar. Elasticsearch antwortete auf `http://127.0.0.1:9200`, Kibana auf `http://127.0.0.1:5601/api/status`. Beide Dienste waren über systemd aktiv und aktiviert.

Damit ist die technische Basis für die nächsten Realisierungsschritte vorhanden. Noch nicht umgesetzt ist an dieser Stelle die eigentliche Datenübernahme aus Cortex Cloud. Dieser Schritt folgt separat, sobald die API-Zugangsdaten lokal konfiguriert und die benötigten Endpunkte bestätigt sind.

{{< ki >}}
