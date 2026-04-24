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

Der Kandidat verwendet eine tägliche Branch-Strategie und erstellt pro Arbeitstag einen eigenen Branch (z. B. `day-3-2026-04-24`). Innerhalb des Tages werden auf diesem Branch mehrere Commits erstellt. Dadurch sind Zwischenstände sauber dokumentiert und können bei Bedarf auf den Stand des Vortags zurückgesetzt werden.

Die Branches dienen als zusätzliche Sicherungsebene:

- Tagesstände sind klar voneinander getrennt.
- Fehlerhafte Änderungen können isoliert verworfen werden, ohne andere Tage zu beeinflussen.
- Der Rückgriff auf einen stabilen Tagesstand ist jederzeit möglich.

{{< figure src="/images/datensicherung-github-screenshot.png" caption="Repository-Stand auf GitHub als Nachweis der Datensicherung." />}}

{{< ki >}}
