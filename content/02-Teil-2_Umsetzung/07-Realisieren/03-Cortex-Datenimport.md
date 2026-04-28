---
title: "Cortex-Cloud-Datenimport"
description: ""
weight: 3
pdfSectionId: "cortex-datenimport"
---

## Ausgangslage

Nach dem Aufbau der lokalen Entwicklungsumgebung musste die Verbindung zur {{< glossary "Cortex Cloud" >}}-API aufgebaut und die benötigten Daten nach {{< glossary "Elasticsearch" >}} überführt werden. Ziel war ein lauffähiges Pull-Script, das für jeden relevanten Endpunkt eine JSON-Antwort abruft, lokal als Datei speichert und die Dokumente in den Elasticsearch-Index schreibt.

## Aufbau des Pull-Scripts

Das Pull-Script wurde als eigenständiges Python-Skript unter `/home/taamanii/elastic-dev/scripts/cortex-pull/` umgesetzt. Die Dateien des Moduls sind in der folgenden Tabelle aufgeführt.

{{< table "Dateien des Cortex-Pull-Moduls" >}}

| Datei | Zweck |
| :-- | :-- |
| `cortex_pull.py` | Hauptskript: Konfiguration laden, Endpunkte aufrufen, JSON schreiben, nach Elasticsearch indexieren |
| `requirements.txt` | Python-Abhängigkeiten (`requests`) |
| `.env.example` | Versionierte Vorlage für Cortex- und Elasticsearch-Zugangsdaten |
| `.env` | Lokale Konfigurationsdatei mit echten Werten, nicht versioniert |
| `README.md` | Setup-Anleitung, Aufrufbeschreibung, Authentisierungsmodi, Endpunktliste |
| `out/` | Ausgabeordner für JSON-Dateien und Run-Summary pro Lauf |

{{< /table >}}

Für das Einlesen der `.env`-Datei wurde auf eine externe Bibliothek verzichtet und stattdessen ein schlanker Inline-Parser im Skript selbst umgesetzt. Dadurch entfällt die Abhängigkeit von `python-dotenv`, was den Setup-Aufwand reduziert.

## Authentisierung

Die Cortex-Cloud-API unterstützt zwei Authentisierungsmodi.

{{< table "Authentisierungsmodi der Cortex-Cloud-API" >}}

| Modus | Schlüssellänge | Header |
| :-- | :-- | :-- |
| Standard | < 100 Zeichen | `x-xdr-auth-id`, `x-xdr-nonce`, `Authorization` (MD5-Digest) |
| Advanced | ≥ 100 Zeichen | `x-xdr-auth-id`, `x-xdr-nonce`, `x-xdr-timestamp`, `Authorization` (SHA-256-Hex-Signatur über API-Key + Nonce + Timestamp) |

{{< /table >}}

Der auf dem Tenant eingesetzte API-Key ist 128 Zeichen lang. Cortex erwartet in diesem Fall den Advanced-Modus: Die Authentisierung wird aus einer Nonce, einem Unix-Millisekunden-Zeitstempel und dem SHA-256-Hex-Wert über die Verkettung `api_key + nonce + timestamp` gebildet. Das Skript erkennt den Modus automatisch anhand der Schlüssellänge und wählt den passenden Header-Satz.

Der Konfigurationswert `CORTEX_API_KEY_TYPE` erlaubt eine explizite Überschreibung mit den Werten `auto`, `standard` oder `advanced`.

## Endpunktkorrektur anhand der offiziellen API-Dokumentation

Die zunächst verwendeten Pfade stammten aus einem inoffiziellen Go-SDK und lieferten auf mehreren Endpunkten HTTP 500. Nach dem Abgleich mit der offiziellen Cortex-Cloud-API-Dokumentation (`99_Anhang/CortexCloudDocumentationAPI.pdf`, Kapitel 2.1.16 und 2.1.26) wurden die betroffenen Pfade und Request-Bodies korrigiert.

{{< table "Endpunktkorrekturen anhand der offiziellen API-Dokumentation" >}}

| Endpunkt | Bisheriger Pfad | Korrekter Pfad (PDF) | Methode | PDF-Referenz |
| :-- | :-- | :-- | :-- | :-- |
| `health_check` | `public_api/v1/health_check/` | `public_api/v1/healthcheck` | GET | §2.1.26.1 |
| `get_tenant_info` | `public_api/v1/get_tenant_info/` | `public_api/v1/system/get_tenant_info` | POST | §2.1.26.2 |
| `risky_users` | `public_api/v1/risk/get_risky_users/` | `public_api/v1/get_risky_users` | POST | §2.1.26.8 |
| `risky_hosts` | `public_api/v1/risky_hosts/` | `public_api/v1/get_risky_hosts` | POST | §2.1.26.9 |
| `issues` | `public_api/v1/issues/get_issues_multi_events/` | `public_api/v1/issue/search` | POST | §2.1.16.2 |

{{< /table >}}

Neben den Pfaden wurden auch die Request-Bodies angepasst. Mehrere Endpunkte erwarten als Body `{}` statt `{"request_data": {}}`. Der Issues-Endpunkt erwartet einen Filterausdruck mit dem Feld `_insert_time` (nicht `creation_time`).

Der Endpunkt `get_risk_score` wurde bewusst aus der Aufruf-Liste entfernt, weil er eine konkrete User- oder Endpoint-ID als Pflichtparameter erfordert und somit nicht für einen Discovery-Lauf geeignet ist.

Nach der Korrektur lieferten 6 von 8 aufgerufenen Endpunkten HTTP 200. Die verbleibenden 2 Endpunkte (`risky_users`, `risky_hosts`) antworten mit einem strukturierten Fehler `No identity threat`, weil das Identity-Threat-Modul auf dem Tenant nicht lizenziert ist. Dieses Verhalten ist eine Tenant-Eigenschaft, kein Skript-Problem.

## Compliance-Endpunkte

Die Prüfung der bereits indexierten Daten ergab, dass kein dedizierter Compliance-Wert aus den vorhandenen Issues ableitbar war. Für eine belastbare Compliance-Prozentzahl sind deshalb separate Compliance-Endpunkte notwendig.

Die Endpunkte wurden aus der offiziellen API-Dokumentation übernommen (Kapitel 2.5 und 2.8). Vier Endpunkte sind ohne Pflicht-Parameter aufrufbar und eignen sich für den Discovery-Lauf.

{{< table "Compliance-Endpunkte aus der offiziellen API-Dokumentation" >}}

| Endpunkt | Pfad | PDF-Referenz |
| :-- | :-- | :-- |
| `compliance_standards` | `public_api/v1/compliance/get_standards` | §2.8.9.1 |
| `compliance_assessment_profiles` | `public_api/v1/compliance/get_assessment_profiles` | §2.8.2.1 |
| `compliance_assessment_results` | `public_api/v1/compliance/get_assessment_results` | §2.8.3.1 |
| `compliance_reports` | `public_api/v1/compliance/get_reports` | §2.8.8.1 |

{{< /table >}}

Alle vier Endpunkte antworteten nach der Ergänzung mit HTTP 200. Damit stieg die Erfolgsrate auf 10 von 12 aufgerufenen Endpunkten.

## Ergebnis: Elasticsearch-Indizes

Nach dem abschliessenden Discovery-Lauf enthält die lokale Elasticsearch-Instanz die folgenden Indizes mit echten Cortex-Cloud-Daten.

{{< table "Elasticsearch-Indizes nach dem Cortex-Pull-Lauf" >}}

| Index | Dokumentanzahl |
| :-- | :-- |
| `cortex-rbac-get-users` | 492 |
| `cortex-issues` | 105 |
| `cortex-compliance-standards` | 100 |
| `cortex-compliance-assessment-results` | 34 |
| `cortex-compliance-assessment-profiles` | 17 |
| `cortex-asset-groups` | 64 |
| `cortex-get-tenant-info` | 6 |
| `cortex-authentication-settings` | 4 |
| `cortex-health-check` | 3 |
| `cortex-compliance-reports` | 1 |

{{< /table >}}

Jedes Dokument wird vom Skript mit den Metafeldern `@timestamp`, `cortex_endpoint` und `cortex_run_id` ergänzt. Das Feld `@timestamp` ermöglicht die zeitbasierte Filterung in Kibana und in späteren EQL-Abfragen.

Der Index `cortex-compliance-reports` enthält einen einzigen Eintrag, weil auf dem Tenant noch keine archivierten Compliance-Reports vorhanden sind. Der Endpunkt selbst funktioniert korrekt und wird beim nächsten Lauf automatisch befüllt, sobald ein Report archiviert wird.

## Offene Punkte

Der aktuelle Stand belegt, dass die Datenstrecke von Cortex Cloud nach Elasticsearch funktioniert. Noch nicht umgesetzt sind:

- die EQL-Abfragen für die einzelnen Metriken
- die TypeScript-Schicht, die die EQL-Ergebnisse dem Frontend bereitstellt
- der formale Soll-Ist-Vergleich im Testteil
