---
title: "Datensicherung"
description: ""
weight: 3
---

Die Datensicherung erfolgt während der gesamten IPA über Git (lokal) und GitHub (remote). Damit sind alle Änderungen versioniert, nachvollziehbar und bei lokalem Datenverlust wiederherstellbar.

Gesichert werden:

- Dokumentationsdateien im Repository
- Quellcode und Konfigurationsdateien
- Anhänge und weitere IPA-relevante Dateien im Projektordner

Ich arbeite direkt auf dem Branch `master` und erstelle mehrmals täglich Commits. Dadurch sind Zwischenstände sauber dokumentiert und können bei Bedarf auf einen früheren Stand zurückgesetzt werden.

{{< figure src="/images/datensicherung-github-screenshot.png" caption="Repository-Stand auf GitHub als Nachweis der Datensicherung." />}}

{{< ki >}}
