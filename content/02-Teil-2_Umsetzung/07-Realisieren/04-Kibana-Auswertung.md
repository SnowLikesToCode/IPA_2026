---
title: "Kibana-Auswertung und Canvas-Workpad"
description: ""
weight: 4
pdfSectionId: "kibana-auswertung"
---

## Ausgangslage

Mit den indexierten Cortex-Cloud-Daten in Elasticsearch war die Datengrundlage für eine erste Visualisierung vorhanden. Im nächsten Schritt wurden die Daten in {{< glossary "Kibana" >}} auswertbar gemacht. Dazu war zunächst die Authentisierung am lokalen Cluster zu aktivieren, um einen vollwertigen Superuser-Zugriff zu erhalten. Danach wurden Data Views für die relevanten Indizes angelegt und ein Canvas-Workpad mit den drei Kernmetriken erstellt.

## Aktivierung der Elasticsearch-Sicherheitskonfiguration

Die initiale Entwicklungsumgebung lief ohne Authentisierung (`xpack.security.enabled: false`). Für eine professionelle Endabnahme und den vollständigen Schreibzugriff in Kibana Canvas war es notwendig, die Sicherheitskonfiguration zu aktivieren. Ohne aktives Security operiert Kibana in einem anonymen Kontext, in dem Canvas-Workpads nicht importiert werden können.

Die Konfiguration in `/etc/elasticsearch/elasticsearch.yml` wurde entsprechend angepasst. TLS und Enrollment wurden bewusst deaktiviert, weil die Instanz lokal und isoliert auf `127.0.0.1` betrieben wird.

```yaml
xpack.security.enabled: true
xpack.security.enrollment.enabled: false
xpack.security.http.ssl.enabled: false
xpack.security.transport.ssl.enabled: false
```

Nach dem Neustart von Elasticsearch wurden die Passwörter für die Built-in-Benutzer `elastic` und `kibana_system` mit `elasticsearch-reset-password` zurückgesetzt. Der `kibana_system`-Service-Account wurde in `/etc/kibana/kibana.yml` eingetragen, damit Kibana sich gegenüber Elasticsearch authentisieren kann. Nach dem Neustart beider Dienste war Elasticsearch nur noch mit gültigem Basic-Auth erreichbar und Kibana zeigte die Login-Maske.

Das Pull-Script `cortex_pull.py` wurde um optionale Basic-Auth-Unterstützung erweitert. Die Variablen `ES_USERNAME` und `ES_PASSWORD` werden aus der lokalen `.env` gelesen. Wenn beide Werte gesetzt sind, wird jeder Elasticsearch-Request mit Basic-Auth versehen. Sind die Werte leer, läuft das Skript ohne Auth-Header — nützlich für Umgebungen ohne aktiviertes Security.

## Kibana Data Views

Für alle relevanten Cortex-Indizes wurden Data Views in Kibana angelegt. Das Zeitfeld `@timestamp` wurde in jedem Data View als primäres Zeitfeld gesetzt. Damit sind die Daten in Kibana zeitbasiert filterbar.

{{< table "Kibana Data Views für Cortex-Compliance-Daten" >}}

| Index | Data-View-Name |
| :-- | :-- |
| `cortex-compliance-standards` | Cortex - Compliance Standards |
| `cortex-compliance-assessment-profiles` | Cortex - Compliance Assessment Profiles |
| `cortex-compliance-assessment-results` | Cortex - Compliance Assessment Results |
| `cortex-compliance-reports` | Cortex - Compliance Reports |

{{< /table >}}

## Canvas-Workpad „Cortex Cloud – Overview"

Der Workpad bündelt die drei vom Auftraggeber definierten Kernmetriken auf einer einzelnen Canvas-Seite und ist über die Kibana-Saved-Objects-API importierbar.

{{< table "Canvas-Elemente des Workpads" >}}

| Element | Datenquelle | Aggregationslogik | Live-Wert |
| :-- | :-- | :-- | :-- |
| Compliance % | `cortex-compliance-assessment-results` | `AVG("SCORE")` über Dokumente mit `TYPE = 'profile'`, gerundet auf eine Dezimalstelle | 60.4 |
| Issues per Severity | `cortex-issues` | Anzahl pro `severity.keyword`, absteigend sortiert | CRITICAL: 102 |
| Issues – Past 30 Days | `cortex-issues` | Alle Issues der letzten 30 Tage, neueste zuerst, max. 100 Einträge | 105 Zeilen |

{{< /table >}}

Die Compliance-%-Kennzahl basiert auf dem `SCORE`-Feld der Assessment-Result-Dokumente mit `TYPE = 'profile'`. Dieser Feldtyp ist im PDF §2.8.3.1 definiert und enthält einen Prozentwert (0–100) pro Compliance-Profil. Dokumente mit `TYPE = 'standard'` besitzen kein gefülltes `SCORE`-Feld und werden deshalb mit einem WHERE-Filter ausgeschlossen. Der Mittelwert über die 17 Profile ergibt einen Tenant-spezifischen Compliance-Wert von 60.4 %.

Der Severity-Chart zeigt für diesen Tenant ausschliesslich den Bucket „CRITICAL" mit 102 Einträgen. Das ist kein Visualisierungsproblem, sondern die echte Datenlage: 102 von 105 Issues auf dem Tenant haben die Severity CRITICAL, 3 Issues haben keinen Severity-Wert.

### SQL-Abfragen hinter den Canvas-Elementen

```sql
-- Compliance %
SELECT ROUND(AVG("SCORE"), 1) AS compliance_pct
FROM "cortex-compliance-assessment-results"
WHERE "TYPE" = 'profile'
```

```sql
-- Issues per Severity
SELECT "severity.keyword", COUNT(*) AS anzahl
FROM "cortex-issues"
GROUP BY "severity.keyword"
ORDER BY 2 DESC
```

```sql
-- Issues – Past 30 Days
SELECT "@timestamp", "severity.keyword", "id", "asset_names", "status.progress.keyword"
FROM "cortex-issues"
WHERE "@timestamp" >= NOW() - INTERVAL '30' DAY
ORDER BY "@timestamp" DESC
LIMIT 100
```

Alle drei Abfragen wurden vor dem Import direkt gegen den Elasticsearch-SQL-Endpunkt (`_sql?format=json`) geprüft und lieferten plausible Ergebnisse.

## Import des Workpads

Der Workpad wird als JSON-Datei (`elastic-dev/kibana/cortex-overview.workpad.json`) über die Kibana-Saved-Objects-API importiert.

```bash
curl -X POST "http://localhost:5601/api/saved_objects/canvas-workpad" \
  -u elastic:<passwort> \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d @cortex-overview.workpad.json
```

Nach dem Import ist der Workpad in Kibana unter **Canvas** sichtbar und zeigt nach einem kurzen Ladevorgang die aktuellen Werte aus dem Elasticsearch-Cluster.

Die fünf vorinstallierten Canvas-Templates (`Pitch`, `Summary`, `Dark`, `Light`, `Status`) erscheinen in der Liste als `canvas-workpad-template` und sind system-seitig schreibgeschützt. Sie zählen nicht zu den eigenen Workpads und können nicht gelöscht werden.

## Ergebnis

Nach Abschluss dieser Arbeiten sind die drei Kernmetriken in Kibana Canvas dargestellt und basieren auf echten Tenant-Daten. Die Datenstrecke von der Cortex-Cloud-API über Elasticsearch bis zur Visualisierung ist damit vollständig aufgebaut und lokal prüfbar.
